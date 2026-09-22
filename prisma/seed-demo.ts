/**
 * YALNIZCA GELİŞTİRME / TASARIM ÖNİZLEMESİ İÇİN demo içerik. ÜRETİMDE ÇALIŞTIRMAYIN.
 * Tüm kayıtlar `isDemo = true` ile işaretlidir ve metinlerinde açıkça "Demo İçerik" yazar. Gerçek kişi/dava/hukuki
 * içerik UYDURULMAZ; yalnızca sayfa düzenini görmek için yer tutucu metinler vardır.
 *
 *   npm run db:seed:demo          → demo kayıtları ekler
 *   npm run db:seed:demo:clear    → yalnızca demo kayıtları siler
 */
import { createPrismaClient } from "../lib/db-client";
import { readingMinutes, htmlToText, normalizeForSearch } from "../lib/text";
import { sanitizeRichText } from "../lib/richtext";

const db = createPrismaClient();

const DEMO_TEAM = [
  { slug: "demo-profil-bir", fullName: "Demo Profil Bir", title: "Kurucu Avukat", sortOrder: 10 },
  { slug: "demo-profil-iki", fullName: "Demo Profil İki", title: "Kıdemli Avukat", sortOrder: 20 },
  { slug: "demo-profil-uc", fullName: "Demo Profil Üç", title: "Avukat", sortOrder: 30 },
];

const article = (n: number) =>
  sanitizeRichText(`<p><strong>Demo İçerik.</strong> Bu yazı, yayın sayfasının tipografisini ve düzenini göstermek için oluşturulmuş yer tutucudur; hukuki bir bilgi içermez. Gerçek yayınlar yönetim panelinden eklenir.</p>
<h2>Birinci ara başlık</h2>
<p>Uzun metinlerde okunabilirlik; satır uzunluğu, satır aralığı ve başlık hiyerarşisiyle sağlanır. Bu paragraf, bir makale gövdesinde metnin nasıl göründüğünü değerlendirmek amacıyla yazılmıştır. <a href="/iletisim">Bağlantılar</a> alt çizgiyle belirtilir.</p>
<h3>Alt başlık örneği</h3>
<ul><li>Madde işaretli liste birinci öğe</li><li>Madde işaretli liste ikinci öğe</li><li>Madde işaretli liste üçüncü öğe</li></ul>
<blockquote><p>Alıntı bloğu örneği: Demo İçerik ${n}.</p></blockquote>
<h2>İkinci ara başlık</h2>
<ol><li>Numaralı liste birinci öğe</li><li>Numaralı liste ikinci öğe</li></ol>
<table><thead><tr><th>Sütun A</th><th>Sütun B</th><th>Sütun C</th></tr></thead><tbody><tr><td>Demo</td><td>Demo</td><td>Demo</td></tr><tr><td>Demo</td><td>Demo</td><td>Demo</td></tr></tbody></table>
<hr>
<p>Yazının sonu. Demo İçerik ${n}.</p>`);

const DEMO_PUBS = [
  { slug: "demo-icerik-yayin-bir", title: "Demo İçerik: Yayın Başlığı Örneği", cat: "genel", featured: true, daysAgo: 3 },
  { slug: "demo-icerik-yayin-iki", title: "Demo İçerik: İkinci Yayın Örneği", cat: "is-ve-sosyal-guvenlik-hukuku", featured: false, daysAgo: 12 },
  { slug: "demo-icerik-yayin-uc", title: "Demo İçerik: Üçüncü Yayın Örneği", cat: "aile-hukuku", featured: false, daysAgo: 30 },
];

async function clear() {
  const pubs = await db.publication.deleteMany({ where: { isDemo: true } });
  const team = await db.teamMember.deleteMany({ where: { isDemo: true } });
  console.log(`Demo kayıtlar silindi: ${pubs.count} yayın, ${team.count} ekip profili.`);
}

async function add() {
  const areas = await db.practiceArea.findMany({ select: { id: true }, take: 3, orderBy: { sortOrder: "asc" } });
  for (const t of DEMO_TEAM) {
    await db.teamMember.upsert({
      where: { slug: t.slug },
      update: {},
      create: {
        ...t,
        shortBio: "Demo İçerik — bu profil tasarımı göstermek için oluşturulmuş bir yer tutucudur. Gerçek bilgiler yönetim panelinden girilecektir.",
        bio: "<p>Demo İçerik. Gerçek özgeçmiş bilgisi yönetim panelinden girildiğinde bu alanın yerini alır.</p>",
        education: ["Demo İçerik — eğitim bilgisi girilecek"],
        languages: ["Demo İçerik"],
        status: "PUBLISHED",
        publishedAt: new Date(),
        isDemo: true,
        practiceAreas: { connect: areas },
      },
    });
  }
  for (const p of DEMO_PUBS) {
    const category = await db.category.findUnique({ where: { slug: p.cat } });
    const content = article(1);
    await db.publication.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        slug: p.slug,
        title: p.title,
        excerpt: "Demo İçerik — yayın kartlarının ve makale sayfasının görünümünü göstermek için oluşturulmuş yer tutucu metin.",
        content,
        searchText: normalizeForSearch(`${p.title} ${htmlToText(content)}`),
        readingMinutes: readingMinutes(content),
        categoryId: category?.id,
        authorName: "LRN Hukuk",
        featured: p.featured,
        status: "PUBLISHED",
        publishedAt: new Date(Date.now() - p.daysAgo * 86_400_000),
        isDemo: true,
      },
    });
  }
  console.log("Demo içerik eklendi (3 ekip profili, 3 yayın). Temizlemek için: npm run db:seed:demo:clear");
}

const run = process.argv.includes("--clear") ? clear : add;
run()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
