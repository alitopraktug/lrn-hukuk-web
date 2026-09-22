/**
 * Üretim-güvenli başlangıç verisi (tekrar çalıştırılabilir / idempotent):
 *   - Site ayarları satırı (varsayılan metinlerle),
 *   - 7 çalışma alanı (mevcutsa DOKUNULMAZ — panelde yapılan düzenlemeler ezilmez),
 *   - Yayın kategorileri,
 *   - 3 ekip üyesi YER TUTUCUSU (taslak → sitede görünmez; panelden gerçek bilgiler girilip yayınlanır),
 *   - Düzenlenebilir sayfalar (Ana Sayfa, Hakkımızda, KVKK, Çerez, Gizlilik, Kullanım Koşulları).
 * Gerçek kişi adı, telefon, adres, e-posta vb. UYDURULMAZ.
 *
 *   npm run db:seed
 */
import { createPrismaClient } from "../lib/db-client";
import { ABOUT_DEFAULTS, DEFAULT_SETTINGS, HOME_DEFAULTS, LEGAL_DEFAULTS, PAGE_META } from "../lib/content/defaults";
import { sanitizeRichText } from "../lib/richtext";
import { DEFAULT_CATEGORIES, PRACTICE_AREAS } from "./seed-data/practice-areas";

const db = createPrismaClient();

async function main() {
  // Site ayarları
  await db.siteSetting.upsert({
    where: { id: "site" },
    update: {},
    create: {
      id: "site",
      firmName: DEFAULT_SETTINGS.firmName,
      defaultTitle: DEFAULT_SETTINGS.defaultTitle,
      defaultDescription: DEFAULT_SETTINGS.defaultDescription,
      footerText: DEFAULT_SETTINGS.footerText,
      publicationDisclaimer: DEFAULT_SETTINGS.publicationDisclaimer,
      contactNotice: DEFAULT_SETTINGS.contactNotice,
      contactConsentLabel: DEFAULT_SETTINGS.contactConsentLabel,
    },
  });

  // Çalışma alanları — yalnızca yoksa oluştur
  const now = new Date();
  for (const [i, area] of PRACTICE_AREAS.entries()) {
    await db.practiceArea.upsert({
      where: { slug: area.slug },
      update: {},
      create: {
        slug: area.slug,
        title: area.title,
        shortDescription: area.shortDescription,
        topics: area.topics,
        content: sanitizeRichText(area.content),
        status: "PUBLISHED",
        publishedAt: now,
        sortOrder: (i + 1) * 10,
      },
    });
  }

  // Kategoriler (çalışma alanlarıyla eşleşen + Genel)
  for (const [i, cat] of DEFAULT_CATEGORIES.entries()) {
    const area = cat.areaSlug ? await db.practiceArea.findUnique({ where: { slug: cat.areaSlug }, select: { id: true } }) : null;
    await db.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: { name: cat.name, slug: cat.slug, sortOrder: (i + 1) * 10, practiceAreaId: area?.id ?? null },
    });
  }

  // Ekip üyesi yer tutucuları (TASLAK)
  const placeholders = [
    { slug: "kurucu-avukat", title: "Kurucu Avukat", sortOrder: 10 },
    { slug: "kidemli-avukat", title: "Kıdemli Avukat", sortOrder: 20 },
    { slug: "avukat", title: "Avukat", sortOrder: 30 },
  ];
  for (const p of placeholders) {
    await db.teamMember.upsert({
      where: { slug: p.slug },
      update: {},
      create: { slug: p.slug, fullName: "Ad Soyad (girilecek)", title: p.title, status: "DRAFT", sortOrder: p.sortOrder },
    });
  }

  // Sayfalar
  const pages: { key: keyof typeof PAGE_META; data?: Record<string, string>; content?: string }[] = [
    { key: "home", data: HOME_DEFAULTS },
    { key: "about", data: ABOUT_DEFAULTS },
    { key: "kvkk", content: LEGAL_DEFAULTS.kvkk },
    { key: "cookies", content: LEGAL_DEFAULTS.cookies },
    { key: "privacy", content: LEGAL_DEFAULTS.privacy },
    { key: "terms", content: LEGAL_DEFAULTS.terms },
  ];
  for (const p of pages) {
    await db.page.upsert({
      where: { key: p.key },
      update: {},
      create: { key: p.key, title: PAGE_META[p.key].title, data: p.data ?? {}, content: p.content ? sanitizeRichText(p.content) : "" },
    });
  }

  const [areas, cats, team] = await Promise.all([db.practiceArea.count(), db.category.count(), db.teamMember.count()]);
  console.log(`Seed tamam: ${areas} çalışma alanı, ${cats} kategori, ${team} ekip kaydı.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
