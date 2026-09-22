import Link from "next/link";
import { ArrowDown, ArrowUp, Plus } from "lucide-react";
import { deleteArea, moveArea, restoreArea, toggleAreaStatus } from "@/app/admin/(panel)/calisma-alanlari/actions";
import { ConfirmForm } from "@/components/admin/client";
import { EmptyRow, PageHeader, StatusBadge, Table, Tabs, btnClass, td, th } from "@/components/admin/ui";
import { requireUser } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { formatShortDate, pad2 } from "@/lib/utils";

export const metadata = { title: "Çalışma alanları" };

export default async function AreasAdminPage({ searchParams }: { searchParams: Promise<{ durum?: string }> }) {
  await requireUser({ permission: "area:manage" });
  const { durum } = await searchParams;
  const trash = durum === "silinen";

  const [items, trashCount] = await Promise.all([
    db.practiceArea.findMany({
      where: trash ? { deletedAt: { not: null } } : { deletedAt: null },
      orderBy: trash ? { updatedAt: "desc" } : [{ sortOrder: "asc" }, { createdAt: "asc" }],
      select: { id: true, title: true, slug: true, status: true, updatedAt: true, deletedAt: true, _count: { select: { teamMembers: true, relatedPublications: true } } },
    }),
    db.practiceArea.count({ where: { deletedAt: { not: null } } }),
  ]);

  return (
    <>
      <PageHeader
        title="Çalışma alanları"
        description="Sitede yayınlanan hukuk alanları. Sıralamayı oklarla değiştirebilirsiniz; ana sayfa ve menülerde bu sırayla görünür."
        actions={
          <Link href="/admin/calisma-alanlari/yeni" className={btnClass.primary}>
            <Plus size={16} aria-hidden="true" />
            Yeni alan
          </Link>
        }
      />
      <Tabs
        items={[
          { href: "/admin/calisma-alanlari", label: "Alanlar", active: !trash },
          { href: "/admin/calisma-alanlari?durum=silinen", label: "Silinenler", active: trash, count: trashCount },
        ]}
      />
      <Table>
        <thead>
          <tr>
            {!trash ? <th className={`${th} w-28`}>Sıra</th> : null}
            <th className={th}>Başlık</th>
            <th className={th}>Durum</th>
            <th className={`${th} hidden xl:table-cell`}>Avukat</th>
            <th className={`${th} hidden xl:table-cell`}>Güncellenme</th>
            <th className={`${th} text-right`}>İşlemler</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <EmptyRow>{trash ? "Silinmiş alan yok." : "Henüz çalışma alanı yok."}</EmptyRow>
          ) : (
            items.map((a, i) => (
              <tr key={a.id} className="hover:bg-admin/40">
                {!trash ? (
                  <td className={td}>
                    <div className="flex items-center gap-1">
                      <span className="w-6 text-quiet">{pad2(i + 1)}</span>
                      <form action={moveArea}>
                        <input type="hidden" name="id" value={a.id} />
                        <input type="hidden" name="direction" value="up" />
                        <button disabled={i === 0} aria-label={`${a.title} — yukarı taşı`} className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-forest/10 disabled:opacity-30">
                          <ArrowUp size={16} aria-hidden="true" />
                        </button>
                      </form>
                      <form action={moveArea}>
                        <input type="hidden" name="id" value={a.id} />
                        <input type="hidden" name="direction" value="down" />
                        <button disabled={i === items.length - 1} aria-label={`${a.title} — aşağı taşı`} className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-forest/10 disabled:opacity-30">
                          <ArrowDown size={16} aria-hidden="true" />
                        </button>
                      </form>
                    </div>
                  </td>
                ) : null}
                <td className={td}>
                  <Link href={`/admin/calisma-alanlari/${a.id}`} className="font-semibold text-forest hover:underline">
                    {a.title}
                  </Link>
                  <div className="text-[0.8rem] text-quiet">/calisma-alanlari/{a.slug}</div>
                </td>
                <td className={td}>
                  <StatusBadge status={a.status} deleted={Boolean(a.deletedAt)} />
                </td>
                <td className={`${td} hidden xl:table-cell`}>{a._count.teamMembers}</td>
                <td className={`${td} hidden whitespace-nowrap xl:table-cell`}>{formatShortDate(a.updatedAt)}</td>
                <td className={`${td} text-right`}>
                  <div className="flex flex-nowrap items-center justify-end gap-0.5 whitespace-nowrap">
                    {trash ? (
                      <form action={restoreArea}>
                        <input type="hidden" name="id" value={a.id} />
                        <button className={btnClass.ghost}>Geri yükle</button>
                      </form>
                    ) : (
                      <>
                        <Link href={`/admin/calisma-alanlari/${a.id}`} className={btnClass.ghost}>
                          Düzenle
                        </Link>
                        <Link href={`/admin/calisma-alanlari/${a.id}/onizleme`} target="_blank" className={btnClass.ghost}>
                          Önizle
                        </Link>
                        <form action={toggleAreaStatus}>
                          <input type="hidden" name="id" value={a.id} />
                          <button className={btnClass.ghost}>{a.status === "PUBLISHED" ? "Taslağa al" : "Yayınla"}</button>
                        </form>
                        <ConfirmForm action={deleteArea} hidden={{ id: a.id }} title="Çalışma alanı silinsin mi?" message={<>“{a.title}” sitede görünmez hâle gelir ve silinenler listesine taşınır. Dilerseniz geri yükleyebilirsiniz.</>}>
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
