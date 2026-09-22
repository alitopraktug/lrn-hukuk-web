import "server-only";
import { db } from "@/lib/db";
import { publicAreaWhere, publicPublicationWhere, publicTeamWhere } from "@/lib/data/where";

export type SitemapEntry = { path: string; lastModified?: Date; changeFrequency?: "weekly" | "monthly" | "yearly"; priority?: number };

/** Sitemap için yalnızca herkese açık (yayında, silinmemiş) kayıtlar. Taslaklar asla dahil edilmez. */
export async function getSitemapEntries(): Promise<SitemapEntry[]> {
  const [areas, team, pubs, pages] = await Promise.all([
    db.practiceArea.findMany({ where: publicAreaWhere, select: { slug: true, updatedAt: true }, orderBy: { sortOrder: "asc" } }),
    db.teamMember.findMany({ where: publicTeamWhere, select: { slug: true, updatedAt: true }, orderBy: { sortOrder: "asc" } }),
    db.publication.findMany({ where: publicPublicationWhere(), select: { slug: true, updatedAt: true }, orderBy: { publishedAt: "desc" } }),
    db.page.findMany({ select: { key: true, updatedAt: true } }),
  ]);
  const pageUpdated = new Map(pages.map((p) => [p.key, p.updatedAt]));

  const latest = (dates: Date[]) => (dates.length ? new Date(Math.max(...dates.map((d) => d.getTime()))) : undefined);

  return [
    { path: "/", changeFrequency: "weekly", priority: 1, lastModified: pageUpdated.get("home") },
    { path: "/hakkimizda", changeFrequency: "monthly", priority: 0.7, lastModified: pageUpdated.get("about") },
    { path: "/ekibimiz", changeFrequency: "monthly", priority: 0.7, lastModified: latest(team.map((t) => t.updatedAt)) },
    { path: "/calisma-alanlari", changeFrequency: "monthly", priority: 0.9, lastModified: latest(areas.map((a) => a.updatedAt)) },
    { path: "/yayinlar", changeFrequency: "weekly", priority: 0.8, lastModified: latest(pubs.map((p) => p.updatedAt)) },
    { path: "/iletisim", changeFrequency: "yearly", priority: 0.6 },
    { path: "/kvkk", changeFrequency: "yearly", priority: 0.2, lastModified: pageUpdated.get("kvkk") },
    { path: "/cerez-politikasi", changeFrequency: "yearly", priority: 0.2, lastModified: pageUpdated.get("cookies") },
    { path: "/gizlilik", changeFrequency: "yearly", priority: 0.2, lastModified: pageUpdated.get("privacy") },
    { path: "/kullanim-kosullari", changeFrequency: "yearly", priority: 0.2, lastModified: pageUpdated.get("terms") },
    ...areas.map((a) => ({ path: `/calisma-alanlari/${a.slug}`, lastModified: a.updatedAt, changeFrequency: "monthly" as const, priority: 0.8 })),
    ...team.map((t) => ({ path: `/ekibimiz/${t.slug}`, lastModified: t.updatedAt, changeFrequency: "monthly" as const, priority: 0.6 })),
    ...pubs.map((p) => ({ path: `/yayinlar/${p.slug}`, lastModified: p.updatedAt, changeFrequency: "monthly" as const, priority: 0.7 })),

    // İngilizce (/en) — yayınlar (blog) hariç: makale içeriği her zaman Türkçe olduğundan, kafa karıştırıcı
    // olmaması için /en/publications/[slug] adresleri site haritasına eklenmez (bkz. README).
    { path: "/en", changeFrequency: "weekly", priority: 0.9, lastModified: pageUpdated.get("home") },
    { path: "/en/about", changeFrequency: "monthly", priority: 0.6, lastModified: pageUpdated.get("about") },
    { path: "/en/team", changeFrequency: "monthly", priority: 0.6, lastModified: latest(team.map((t) => t.updatedAt)) },
    { path: "/en/practice-areas", changeFrequency: "monthly", priority: 0.8, lastModified: latest(areas.map((a) => a.updatedAt)) },
    { path: "/en/publications", changeFrequency: "weekly", priority: 0.5 },
    { path: "/en/contact", changeFrequency: "yearly", priority: 0.5 },
    ...areas.map((a) => ({ path: `/en/practice-areas/${a.slug}`, lastModified: a.updatedAt, changeFrequency: "monthly" as const, priority: 0.7 })),
    ...team.map((t) => ({ path: `/en/team/${t.slug}`, lastModified: t.updatedAt, changeFrequency: "monthly" as const, priority: 0.5 })),
  ];
}
