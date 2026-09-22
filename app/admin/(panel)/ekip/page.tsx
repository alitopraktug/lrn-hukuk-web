import Link from "next/link";
import { ArrowDown, ArrowUp, Plus } from "lucide-react";
import { deleteTeamMember, moveTeamMember, restoreTeamMember, toggleTeamStatus } from "@/app/admin/(panel)/ekip/actions";
import { ConfirmForm } from "@/components/admin/client";
import { Alert, Badge, EmptyRow, PageHeader, StatusBadge, Table, Tabs, btnClass, td, th } from "@/components/admin/ui";
import { requireUser } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { formatShortDate, pad2 } from "@/lib/utils";

export const metadata = { title: "Ekip" };

export default async function TeamAdminPage({ searchParams }: { searchParams: Promise<{ durum?: string }> }) {
  await requireUser({ permission: "team:manage" });
  const { durum } = await searchParams;
  const trash = durum === "silinen";

  const [items, trashCount, activeCount] = await Promise.all([
    db.teamMember.findMany({
      where: trash ? { deletedAt: { not: null } } : { deletedAt: null },
      orderBy: trash ? { updatedAt: "desc" } : [{ sortOrder: "asc" }, { createdAt: "asc" }],
      select: { id: true, fullName: true, title: true, slug: true, status: true, updatedAt: true, deletedAt: true, isDemo: true, photoId: true },
    }),
    db.teamMember.count({ where: { deletedAt: { not: null } } }),
    db.teamMember.count({ where: { deletedAt: null, status: "PUBLISHED" } }),
  ]);
  const placeholders = items.filter((m) => m.fullName.includes("(girilecek)")).length;

  return (
    <>
      <PageHeader
        title="Ekip"
        description="Avukat profillerini buradan yönetin. Yeni bir avukat eklediğinizde profil sayfası otomatik oluşur; sayıda sınır yoktur."
        actions={
          <Link href="/admin/ekip/yeni" className={btnClass.primary}>
            <Plus size={16} aria-hidden="true" />
            Yeni ekip üyesi
          </Link>
        }
      />
      {!trash && placeholders > 0 ? (
        <Alert tone="info" className="mb-6">
          “Ad Soyad (girilecek)” yazan {placeholders} yer tutucu profil var. Gerçek bilgileri girip <strong>“Kaydet ve sitede göster”</strong> ile aktifleştirene kadar bu profiller sitede görünmez.
        </Alert>
      ) : null}
      <Tabs
        items={[
          { href: "/admin/ekip", label: "Ekip", active: !trash, count: activeCount },
          { href: "/admin/ekip?durum=silinen", label: "Silinenler", active: trash, count: trashCount },
        ]}
      />
      <Table>
        <thead>
          <tr>
            {!trash ? <th className={`${th} w-28`}>Sıra</th> : null}
            <th className={th}>Ad soyad</th>
            <th className={th}>Durum</th>
            <th className={`${th} hidden 2xl:table-cell`}>Fotoğraf</th>
            <th className={`${th} hidden xl:table-cell`}>Güncellenme</th>
            <th className={`${th} text-right`}>İşlemler</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <EmptyRow>{trash ? "Silinmiş ekip üyesi yok." : "Henüz ekip üyesi yok."}</EmptyRow>
          ) : (
            items.map((m, i) => (
              <tr key={m.id} className="hover:bg-admin/40">
                {!trash ? (
                  <td className={td}>
                    <div className="flex items-center gap-1">
                      <span className="w-6 text-quiet">{pad2(i + 1)}</span>
                      <form action={moveTeamMember}>
                        <input type="hidden" name="id" value={m.id} />
                        <input type="hidden" name="direction" value="up" />
                        <button disabled={i === 0} aria-label={`${m.fullName} — yukarı taşı`} className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-forest/10 disabled:opacity-30">
                          <ArrowUp size={16} aria-hidden="true" />
                        </button>
                      </form>
                      <form action={moveTeamMember}>
                        <input type="hidden" name="id" value={m.id} />
                        <input type="hidden" name="direction" value="down" />
                        <button disabled={i === items.length - 1} aria-label={`${m.fullName} — aşağı taşı`} className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-forest/10 disabled:opacity-30">
                          <ArrowDown size={16} aria-hidden="true" />
                        </button>
                      </form>
                    </div>
                  </td>
                ) : null}
                <td className={td}>
                  <Link href={`/admin/ekip/${m.id}`} className="font-semibold text-forest hover:underline">
                    {m.fullName}
                  </Link>
                  <div className="flex flex-wrap items-center gap-2 text-[0.8rem] text-quiet">
                    <span>{m.title}</span>
                    {m.isDemo ? <Badge tone="amber">Demo İçerik</Badge> : null}
                  </div>
                </td>
                <td className={td}>
                  <StatusBadge status={m.status} deleted={Boolean(m.deletedAt)} active />
                </td>
                <td className={`${td} hidden 2xl:table-cell`}>{m.photoId ? "Var" : <span className="text-quiet">Yok</span>}</td>
                <td className={`${td} hidden whitespace-nowrap xl:table-cell`}>{formatShortDate(m.updatedAt)}</td>
                <td className={`${td} text-right`}>
                  <div className="flex flex-nowrap items-center justify-end gap-0.5 whitespace-nowrap">
                    {trash ? (
                      <form action={restoreTeamMember}>
                        <input type="hidden" name="id" value={m.id} />
                        <button className={btnClass.ghost}>Geri yükle</button>
                      </form>
                    ) : (
                      <>
                        <Link href={`/admin/ekip/${m.id}`} className={btnClass.ghost}>
                          Düzenle
                        </Link>
                        <Link href={`/admin/ekip/${m.id}/onizleme`} target="_blank" className={btnClass.ghost}>
                          Önizle
                        </Link>
                        <form action={toggleTeamStatus}>
                          <input type="hidden" name="id" value={m.id} />
                          <button className={btnClass.ghost}>{m.status === "PUBLISHED" ? "Pasife al" : "Aktifleştir"}</button>
                        </form>
                        <ConfirmForm action={deleteTeamMember} hidden={{ id: m.id }} title="Ekip üyesi silinsin mi?" message={<>“{m.fullName}” profili sitede görünmez hâle gelir ve silinenler listesine taşınır. Dilerseniz geri yükleyebilirsiniz.</>}>
                          Sil
                        </ConfirmForm>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </>
  );
}
