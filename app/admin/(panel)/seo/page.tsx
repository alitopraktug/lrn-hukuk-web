import Link from "next/link";
import { SeoForm } from "@/app/admin/(panel)/seo/seo-form";
import { saveSeo } from "@/app/admin/(panel)/ayarlar/actions";
import { Badge, Card, PageHeader, Table, td, th } from "@/components/admin/ui";
import { getPickedMedia } from "@/lib/admin/queries";
import { requireUser } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { absoluteUrl } from "@/lib/env";

export const metadata = { title: "SEO" };

const LEN = { title: [10, 70], desc: [50, 170] } as const;
function lengthTone(value: string | null | undefined, [min, max]: readonly [number, number]) {
  const n = value?.length ?? 0;
  if (n === 0) return <Badge tone="gray">Boş</Badge>;
  if (n < min) return <Badge tone="amber">Kısa ({n})</Badge>;
  if (n > max) return <Badge tone="red">Uzun ({n})</Badge>;
  return <Badge tone="green">Uygun ({n})</Badge>;
}

export default async function SeoPage() {
  await requireUser({ permission: "seo:manage" });
  const [row, pubs, areas, team] = await Promise.all([
    db.siteSetting.findUnique({ where: { id: "site" } }),
    db.publication.findMany({ where: { deletedAt: null, status: "PUBLISHED" }, orderBy: { publishedAt: "desc" }, take: 50, select: { id: true, title: true, seoTitle: true, seoDescription: true, excerpt: true } }),
    db.practiceArea.findMany({ where: { deletedAt: null, status: "PUBLISHED" }, orderBy: { sortOrder: "asc" }, select: { id: true, title: true, seoTitle: true, seoDescription: true, shortDescription: true } }),
    db.teamMember.findMany({ where: { deletedAt: null, status: "PUBLISHED" }, orderBy: { sortOrder: "asc" }, select: { id: true, fullName: true, seoTitle: true, seoDescription: true, shortBio: true } }),
  ]);
  const ogImage = await getPickedMedia(row?.ogImageId);

  const rows = [
    ...areas.map((a) => ({ kind: "Çalışma alanı", name: a.title, href: `/admin/calisma-alanlari/${a.id}`, seoTitle: a.seoTitle, seoDescription: a.seoDescription ?? (a.shortDescription || null) })),
    ...team.map((m) => ({ kind: "Ekip", name: m.fullName, href: `/admin/ekip/${m.id}`, seoTitle: m.seoTitle, seoDescription: m.seoDescription ?? (m.shortBio || null) })),
    ...pubs.map((p) => ({ kind: "Yayın", name: p.title, href: `/admin/yayinlar/${p.id}`, seoTitle: p.seoTitle, seoDescription: p.seoDescription ?? (p.excerpt || null) })),
  ];

  return (
    <>
      <PageHeader
        title="SEO"
        description="Arama motoru görünümü. Amaç doğru ve sade bilgi vermektir; avukatlık meslek kuralları gereği reklam niteliği taşıyan başlık ve anahtar kelimelerden kaçının."
      />
      <div className="space-y-6">
        <SeoForm
          action={saveSeo}
          values={{ defaultTitle: row?.defaultTitle || "LRN Hukuk | Ankara", defaultDescription: row?.defaultDescription ?? "", googleSiteVerification: row?.googleSiteVerification ?? "", ogImage }}
        />

        <Card title="Teknik SEO durumu" description="Bu dosyalar otomatik ve dinamik üretilir; yapılandırma gerekmez.">
          <ul className="grid gap-2 text-[0.92rem] sm:grid-cols-2">
            <li>
              <a href="/sitemap.xml" target="_blank" className="text-forest underline underline-offset-4">
                sitemap.xml
              </a>{" "}
              — yayındaki sayfalar (taslaklar hariç)
            </li>
            <li>
              <a href="/robots.txt" target="_blank" className="text-forest underline underline-offset-4">
                robots.txt
              </a>{" "}
              — /admin dizine alınmaz
            </li>
            <li>Kanonik adres: <code>{absoluteUrl("/")}</code></li>
            <li>Yapılandırılmış veri: Organization, WebSite, Article, Person, BreadcrumbList</li>
          </ul>
        </Card>

        <Card title="Sayfa bazında durum" description="Boş alanlar için başlık/özet otomatik kullanılır. Uzunlukları kontrol edin.">
          <Table className="border-0">
            <thead>
              <tr>
                <th className={th}>Sayfa</th>
                <th className={th}>Tür</th>
                <th className={th}>SEO başlığı</th>
                <th className={th}>Açıklama</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.href}>
                  <td className={td}>
                    <Link href={r.href} className="font-semibold text-forest hover:underline">
                      {r.name}
                    </Link>
                  </td>
                  <td className={td}>{r.kind}</td>
                  <td className={td}>{r.seoTitle ? lengthTone(r.seoTitle, LEN.title) : <Badge tone="gray">Otomatik</Badge>}</td>
                  <td className={td}>{lengthTone(r.seoDescription, LEN.desc)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      </div>
    </>
  );
}
