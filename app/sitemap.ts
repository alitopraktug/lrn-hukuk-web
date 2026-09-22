import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/env";
import { getSitemapEntries, type SitemapEntry } from "@/lib/data/sitemap";

/**
 * Dinamik /sitemap.xml: statik sayfalar + yayındaki çalışma alanları + aktif ekip profilleri + yayımlanmış makaleler.
 * Taslak ve silinmiş içerik ASLA dahil edilmez (bkz. lib/data/where.ts). Yönetim panelinden içerik değiştiğinde revalidatePath ile yenilenir.
 */
export const revalidate = 3600;

const STATIC_FALLBACK: SitemapEntry[] = [
  { path: "/", priority: 1 },
  { path: "/hakkimizda" },
  { path: "/ekibimiz" },
  { path: "/calisma-alanlari" },
  { path: "/yayinlar" },
  { path: "/iletisim" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let entries: SitemapEntry[];
  try {
    entries = await getSitemapEntries();
  } catch (error) {
    console.error("[sitemap] veritabanına erişilemedi, yalnızca statik sayfalar listelendi:", error instanceof Error ? error.message : error);
    entries = STATIC_FALLBACK;
  }
  return entries.map((e) => ({
    url: absoluteUrl(e.path),
    lastModified: e.lastModified,
    changeFrequency: e.changeFrequency,
    priority: e.priority,
  }));
}
