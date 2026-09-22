import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { deletePublication, purgePublication, restorePublication, togglePublicationStatus } from "@/app/admin/(panel)/yayinlar/actions";
import { ConfirmForm } from "@/components/admin/client";
import { AdminPager, Badge, EmptyRow, PageHeader, StatusBadge, Table, Tabs, btnClass, inputClass, td, th } from "@/components/admin/ui";
import { requireUser } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { formatDateTime, formatShortDate } from "@/lib/utils";
import type { Prisma } from "@/generated/prisma/client";
import { normalizeForSearch } from "@/lib/text";

export const metadata = { title: "Yayınlar" };
const PAGE_SIZE = 15;

type SP = Promise<{ durum?: string; q?: string; sayfa?: string }>;

export default async function PublicationsAdminPage({ searchParams }: { searchParams: SP }) {
  await requireUser({ permission: "publication:manage" });
  const sp = await searchParams;
  const durum = ["yayinda", "taslak", "silinen"].includes(sp.durum ?? "") ? (sp.durum as string) : "tumu";
  const q = (sp.q ?? "").trim().slice(0, 80);
  const page = Math.max(1, Number.parseInt(sp.sayfa ?? "1", 10) || 1);

  const base: Prisma.PublicationWhereInput = durum === "silinen" ? { deletedAt: { not: null } } : { deletedAt: null };
  const where: Prisma.PublicationWhereInput = {
    ...base,
    ...(durum === "yayinda" ? { status: "PUBLISHED" } : durum === "taslak" ? { status: "DRAFT" } : {}),
    ...(q ? { searchText: { contains: normalizeForSearch(q) } } : {}),
  };

  const [counts, total] = await Promise.all([
    Promise.all([
      db.publication.count({ where: { deletedAt: null } }),
      db.publication.count({ where: { deletedAt: null, status: "PUBLISHED" } }),
      db.publication.count({ where: { deletedAt: null, status: "DRAFT" } }),
      db.publication.count({ where: { deletedAt: { not: null } } }),
    ]),
    db.publication.count({ where }),
  ]);
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const items = await db.publication.findMany({
    where,
    orderBy: [{ updatedAt: "desc" }],
    skip: (Math.min(page, pageCount) - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      publishedAt: true,
      updatedAt: true,
      deletedAt: true,
      featured: true,
      isDemo: true,
      authorName: true,
      author: { select: { fullName: true } },
      category: { select: { name: true } },
    },
  });

  const href = (o: { durum?: string; q?: string; sayfa?: number }) => {
    const p = new URLSearchParams();
    const d = o.durum ?? durum;
    if (d !== "tumu") p.set("durum", d);
    if ((o.q ?? q) && o.q !== "") p.set("q", o.q ?? q);
    if (o.sayfa && o.sayfa > 1) p.set("sayfa", String(o.sayfa));
    const s = p.toString();
    return `/admin/yayinlar${s ? `?${s}` : ""}`;
  };

  return (
    <>
      <PageHeader
        title="Yayınlar"
        description="Makale ve bilgilendirme yazılarını buradan ekleyin, düzenleyin ve yayımlayın."
        actions={
          <>
            <Link href="/admin/yayinlar/kategoriler" className={btnClass.secondary}>
              Kategoriler
            </Link>
            <Link href="/admin/yayinlar/yeni" className={btnClass.primary}>
              <Plus size={16} aria-hidden="true" />
              Yeni yayın
            </Link>
          </>
        }
      />

      <Tabs
        items={[
          { href: href({ durum: "tumu", sayfa: 1 }), label: "Tümü", active: durum === "tumu", count: counts[0] },
          { href: href({ durum: "yayinda", sayfa: 1 }), label: "Yayında", active: durum === "yayinda", count: counts[1] },
          { href: href({ durum: "taslak", sayfa: 1 }), label: "Taslak", active: durum === "taslak", count: counts[2] },
          { href: href({ durum: "silinen", sayfa: 1 }), label: "Silinenler", active: durum === "silinen", count: counts[3] },
        ]}
      />

      <form role="search" className="mb-5 flex max-w-md gap-2">
        {durum !== "tumu" ? <input type="hidden" name="durum" value={durum} /> : null}
        <label htmlFor="q" className="sr-only">
          Yayınlarda ara
        </label>
        <input id="q" name="q" type="search" defaultValue={q} placeholder="Başlıkta veya metinde ara…" className={inputClass} />
        <button type="submit" className={btnClass.secondary}>
          <Search size={16} aria-hidden="true" />
          Ara
        </button>
      </form>

      <Table>
        <thead>
          <tr>
            <th className={th}>Başlık</th>
            <th className={th}>Durum</th>
            <th className={`${th} hidden xl:table-cell`}>Yazar</th>
            <th className={`${th} hidden xl:table-cell`}>Yayın tarihi</th>
            <th className={`${th} hidden 2xl:table-cell`}>Güncellenme</th>
            <th className={`${th} text-right`}>İşlemler</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <EmptyRow>{q || durum !== "tumu" ? "Bu filtreyle eşleşen yayın yok." : "Henüz yayın yok. “Yeni yayın” ile ilk yazınızı ekleyin."}</EmptyRow>
          ) : (
            items.map((p) => {
              const deleted = Boolean(p.deletedAt);
              return (
                <tr key={p.id} className="hover:bg-admin/40">
                  <td className={td}>
                    <Link href={`/admin/yayinlar/${p.id}`} className="font-semibold text-forest hover:underline">
                      {p.title}
                    </Link>
                    <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[0.8rem] text-quiet">
                      {p.category ? <span>{p.category.name}</span> : null}
                      {p.featured ? <Badge tone="blue">Öne çıkan</Badge> : null}
                      {p.isDemo ? <Badge tone="amber">Demo İçerik</Badge> : null}
                    </div>
                  </td>
                  <td className={td}>
                    <StatusBadge status={p.status} publishedAt={p.publishedAt} deleted={deleted} />
                  </td>
                  <td className={`${td} hidden xl:table-cell`}>{p.author?.fullName ?? p.authorName ?? "LRN Hukuk"}</td>
                  <td className={`${td} hidden whitespace-nowrap xl:table-cell`}>{formatShortDate(p.publishedAt) || "—"}</td>
                  <td className={`${td} hidden whitespace-nowrap 2xl:table-cell`} title={formatDateTime(p.updatedAt)}>
                    {formatShortDate(p.updatedAt)}
                  </td>
                  <td className={`${td} text-right`}>
                    <div className="flex flex-nowrap items-center justify-end gap-0.5 whitespace-nowrap">
                      {deleted ? (
                        <>
                          <form action={restorePublication}>
                            <input type="hidden" name="id" value={p.id} />
                            <button className={btnClass.ghost}>Geri yükle</button>
                          </form>
                          <ConfirmForm action={purgePublication} hidden={{ id: p.id }} title="Kalıcı olarak silinsin mi?" message={<>“{p.title}” kalıcı olarak silinecek. Bu işlem geri alınamaz.</>} confirmLabel="Kalıcı olarak sil">
                            Kalıcı sil
                          </ConfirmForm>
                        </>
                      ) : (
                        <>
                          <Link href={`/admin/yayinlar/${p.id}`} className={btnClass.ghost}>
                            Düzenle
                          </Link>
                          <Link href={`/admin/yayinlar/${p.id}/onizleme`} target="_blank" className={btnClass.ghost}>
                            Önizle
                          </Link>
                          <form action={togglePublicationStatus}>
                            <input type="hidden" name="id" value={p.id} />
                            <button className={btnClass.ghost}>{p.status === "PUBLISHED" ? "Taslağa al" : "Yayınla"}</button>
                          </form>
                          <ConfirmForm
                            action={deletePublication}
                            hidden={{ id: p.id }}
                            title="Yayın silinsin mi?"
                            message={<>“{p.title}” silinenler listesine taşınacak ve sitede görünmeyecek. Dilerseniz daha sonra geri yükleyebilirsiniz.</>}
                          >
                            Sil
                          </ConfirmForm>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </Table>
      <AdminPager page={Math.min(page, pageCount)} pageCount={pageCount} makeHref={(p) => href({ sayfa: p })} />
    </>
  );
}
