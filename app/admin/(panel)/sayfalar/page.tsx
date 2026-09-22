import Link from "next/link";
import { Badge, Card, PageHeader, btnClass } from "@/components/admin/ui";
import { PAGE_KEYS, PAGE_META } from "@/lib/content/defaults";
import { requireUser } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { formatShortDate } from "@/lib/utils";

export const metadata = { title: "Sayfalar" };

export default async function PagesAdminPage() {
  await requireUser({ permission: "page:manage" });
  const rows = await db.page.findMany({ select: { key: true, updatedAt: true, reviewedAt: true } });
  const byKey = new Map(rows.map((r) => [r.key, r]));

  return (
    <>
      <PageHeader title="Sayfalar" description="Ana sayfa metinlerini, Hakkımızda sayfasını ve hukuki metinleri (KVKK, çerez, gizlilik, kullanım koşulları) buradan düzenleyin." />
      <div className="grid gap-4 md:grid-cols-2">
        {PAGE_KEYS.map((key) => {
          const meta = PAGE_META[key];
          const row = byKey.get(key);
          const legal = meta.kind === "richtext";
          return (
            <Card key={key}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-sans text-[1.05rem] font-bold">{meta.title}</h2>
                  <p className="mt-1 text-[0.88rem] text-quiet">{meta.description}</p>
                </div>
                {legal ? row?.reviewedAt ? <Badge tone="green">Onaylı</Badge> : <Badge tone="amber">Onay bekliyor</Badge> : null}
              </div>
              <p className="mt-3 text-[0.82rem] text-quiet">{row ? `Son güncelleme: ${formatShortDate(row.updatedAt)}` : "Henüz düzenlenmedi (varsayılan metin gösteriliyor)"}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href={`/admin/sayfalar/${key}`} className={btnClass.primary}>
                  Düzenle
                </Link>
                <Link href={meta.path} target="_blank" className={btnClass.secondary}>
                  Sayfayı aç
                </Link>
              </div>
            </Card>
          );
        })}
      </div>
    </>
  );
}
