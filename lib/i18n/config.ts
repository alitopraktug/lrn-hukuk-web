/**
 * Çok dilli site desteği. Türkçe (`tr`) tek gerçek kaynak; İngilizce (`en`) statik bir çeviri
 * katmanıdır ve `/en` öneki altında sunulur (bkz. `app/en`). Yeni bir dil eklemek için:
 *  1) LOCALES listesine ekleyin, 2) bu dosyadaki UI sözlüğüne bir sütun ekleyin,
 *  3) `lib/i18n/content-en.ts` deki gibi yeni bir `content-<dil>.ts` yazın,
 *  4) `app/en` klasörünü örnek alan yeni bir `app/<dil>` ağacı oluşturun.
 * Yayınlar (blog yazıları) şu an yalnızca Türkçe içerik olarak yazılabildiği için çevrilmez;
 * `/en/publications/[slug]` sayfası Türkçe içeriği bir uyarıyla birlikte gösterir.
 */
export const LOCALES = ["tr", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "tr";

/** Dil değiştiriciler için yol segmenti eşlemesi (TR ⇄ EN). Bilinmeyen segmentler değişmeden kalır. */
export const PATH_SEGMENTS: Record<string, string> = {
  hakkimizda: "about",
  ekibimiz: "team",
  "calisma-alanlari": "practice-areas",
  yayinlar: "publications",
  iletisim: "contact",
};
export const PATH_SEGMENTS_REVERSE: Record<string, string> = Object.fromEntries(Object.entries(PATH_SEGMENTS).map(([tr, en]) => [en, tr]));

/** Verilen Türkçe (kök) yolu, hedef dildeki karşılığına çevirir. Slug'lar (ör. çalışma alanı) değişmeden kalır. */
export function localizePath(trPath: string, locale: Locale): string {
  if (locale === "tr") return trPath;
  const parts = trPath.split("/").filter(Boolean);
  if (parts.length === 0) return "/en";
  const [first, ...rest] = parts;
  const mapped = PATH_SEGMENTS[first] ?? first;
  return ["", "en", mapped, ...rest].join("/");
}

/** Verilen /en yolunu Türkçe köke çevirir (dil değiştirici "TR" bağlantısı için). */
export function toTrPath(enPath: string): string {
  const parts = enPath.split("/").filter(Boolean); // ["en", "practice-areas", "ceza-hukuku"]
  if (parts[0] !== "en") return enPath;
  const [, first, ...rest] = parts;
  if (!first) return "/";
  const mapped = PATH_SEGMENTS_REVERSE[first] ?? first;
  return ["", mapped, ...rest].join("/");
}

export const UI = {
  tr: {
    skipToContent: "İçeriğe geç",
    nav: { home: "Ana Sayfa", about: "Hakkımızda", team: "Ekibimiz", areas: "Çalışma Alanlarımız", publications: "Yayınlar", contact: "İletişim" },
    menuOpen: "Menü",
    menuClose: "Kapat",
    breadcrumbHome: "Ana Sayfa",
    details: "Detaylar",
    seeAll: "Tümünü gör",
    profile: "Profil",
    read: "Oku",
    readingMinutes: (n: number) => `${n} dk okuma`,
    featured: "Öne çıkan",
    allPublications: "Tüm yayınlar",
    allTeam: "Tüm ekip",
    footerLinksTitle: "Hızlı Bağlantılar",
    footerContactTitle: "İletişim",
    footerLegalTitle: "Bilgilendirme",
    footerContactFormLink: "İletişim formu",
    footerRights: "Tüm hakları saklıdır.",
    footerLocation: "Ankara, Türkiye",
    cookiePrefs: "Çerez Tercihleri",
    languageSwitch: "Dil",
    trOnlyNotice: "Bu içerik şu anda yalnızca Türkçe olarak mevcuttur.",
  },
  en: {
    skipToContent: "Skip to content",
    nav: { home: "Home", about: "About", team: "Our Team", areas: "Practice Areas", publications: "Publications", contact: "Contact" },
    menuOpen: "Menu",
    menuClose: "Close",
    breadcrumbHome: "Home",
    details: "Details",
    seeAll: "View all",
    profile: "Profile",
    read: "Read",
    readingMinutes: (n: number) => `${n} min read`,
    featured: "Featured",
    allPublications: "All publications",
    allTeam: "All team members",
    footerLinksTitle: "Quick Links",
    footerContactTitle: "Contact",
    footerLegalTitle: "Information",
    footerContactFormLink: "Contact form",
    footerRights: "All rights reserved.",
    footerLocation: "Ankara, Türkiye",
    cookiePrefs: "Cookie Preferences",
    languageSwitch: "Language",
    trOnlyNotice: "This content is currently available in Turkish only.",
  },
} as const;
