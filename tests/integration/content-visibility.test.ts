import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { getPracticeAreaBySlug, getPracticeAreas } from "@/lib/data/areas";
import { getPublicationBySlug, listPublications, getLatestPublications } from "@/lib/data/publications";
import { getSitemapEntries } from "@/lib/data/sitemap";
import { getTeamMemberBySlug, getTeamMembers } from "@/lib/data/team";
import { isDbAvailable, prepareDb, resetDb, testDb } from "../helpers/db";
import { normalizeForSearch } from "@/lib/text";

/**
 * Taslak / silinmiş / zamanlanmış içeriğin herkese açık katmanda (sayfalar, arama, sitemap) ASLA görünmediğini doğrular.
 * Gerçek PostgreSQL test veritabanı gerekir (yoksa atlanır).
 */
const available = await isDbAvailable();
const day = 86_400_000;

describe.skipIf(!available)("içerik görünürlüğü (taslak / silinmiş / zamanlanmış)", () => {
  beforeAll(async () => {
    await prepareDb();
    const cat = await testDb.category.create({ data: { name: "Genel", slug: "genel" } });
    const base = { content: "<p>içerik</p>", excerpt: "özet", categoryId: cat.id };
    const mk = (slug: string, extra: Record<string, unknown>) =>
      testDb.publication.create({ data: { slug, title: `Başlık ${slug}`, searchText: normalizeForSearch(`Başlık ${slug} işçi hakları`), ...base, ...extra } });

    await mk("yayinda", { status: "PUBLISHED", publishedAt: new Date(Date.now() - day) });
    await mk("taslak", { status: "DRAFT", publishedAt: null });
    await mk("silinmis", { status: "PUBLISHED", publishedAt: new Date(Date.now() - day), deletedAt: new Date() });
    await mk("zamanlanmis", { status: "PUBLISHED", publishedAt: new Date(Date.now() + 7 * day) });

    await testDb.practiceArea.createMany({
      data: [
        { slug: "alan-yayinda", title: "Alan", status: "PUBLISHED", sortOrder: 20 },
        { slug: "alan-taslak", title: "Taslak Alan", status: "DRAFT", sortOrder: 10 },
        { slug: "alan-silinmis", title: "Silinmiş Alan", status: "PUBLISHED", deletedAt: new Date(), sortOrder: 5 },
      ],
    });
    await testDb.teamMember.createMany({
      data: [
        { slug: "aktif-avukat", fullName: "Aktif Kişi", title: "Avukat", status: "PUBLISHED", sortOrder: 2 },
        { slug: "pasif-avukat", fullName: "Pasif Kişi", title: "Avukat", status: "DRAFT", sortOrder: 1 },
        { slug: "silinmis-avukat", fullName: "Silinmiş Kişi", title: "Avukat", status: "PUBLISHED", deletedAt: new Date(), sortOrder: 3 },
      ],
    });
  });
  afterAll(async () => {
    await resetDb();
    await testDb.$disconnect();
  });

  it("yayında olan makale açılır; taslak, silinmiş ve zamanı gelmemiş makale açılmaz (404)", async () => {
    expect((await getPublicationBySlug("yayinda"))?.title).toBe("Başlık yayinda");
    expect(await getPublicationBySlug("taslak")).toBeNull();
    expect(await getPublicationBySlug("silinmis")).toBeNull();
    expect(await getPublicationBySlug("zamanlanmis")).toBeNull();
    expect(await getPublicationBySlug("yok-boyle-bir-sey")).toBeNull();
  });

  it("listeler ve ana sayfa yalnızca yayındakileri döndürür", async () => {
    const list = await listPublications();
    expect(list.items.map((p) => p.slug)).toEqual(["yayinda"]);
    expect(list.total).toBe(1);
    expect((await getLatestPublications(3)).map((p) => p.slug)).toEqual(["yayinda"]);
  });

  it("arama Türkçe karakterlere duyarsızdır ve taslakları bulmaz", async () => {
    expect((await listPublications({ q: "ISCI haklari" })).total).toBe(1);
    expect((await listPublications({ q: "işçi" })).total).toBe(1);
    expect((await listPublications({ q: "taslak" })).total).toBe(0);
  });

  it("kategori filtresi ve sayfalama çalışır", async () => {
    expect((await listPublications({ category: "genel" })).total).toBe(1);
    expect((await listPublications({ category: "yok" })).total).toBe(0);
    const p = await listPublications({ page: 99 });
    expect(p.page).toBe(1);
  });

  it("çalışma alanları: yalnızca yayındaki ve silinmemiş olanlar, sıraya göre", async () => {
    expect((await getPracticeAreas()).map((a) => a.slug)).toEqual(["alan-yayinda"]);
    expect(await getPracticeAreaBySlug("alan-taslak")).toBeNull();
    expect(await getPracticeAreaBySlug("alan-silinmis")).toBeNull();
    expect((await getPracticeAreaBySlug("alan-yayinda"))?.title).toBe("Alan");
  });

  it("ekip: pasif ve silinmiş üyeler listede ve profil adresinde görünmez", async () => {
    expect((await getTeamMembers()).map((m) => m.slug)).toEqual(["aktif-avukat"]);
    expect(await getTeamMemberBySlug("pasif-avukat")).toBeNull();
    expect(await getTeamMemberBySlug("silinmis-avukat")).toBeNull();
    expect((await getTeamMemberBySlug("aktif-avukat"))?.fullName).toBe("Aktif Kişi");
  });

  it("4. (ve daha fazla) avukat eklenince profil ve sitemap girdisi kod değişikliği olmadan oluşur", async () => {
    await testDb.teamMember.create({ data: { slug: "dorduncu-avukat", fullName: "Dördüncü Kişi", title: "Avukat", status: "PUBLISHED", sortOrder: 40 } });
    expect((await getTeamMembers()).length).toBe(2);
    expect((await getTeamMemberBySlug("dorduncu-avukat"))?.title).toBe("Avukat");
    const paths = (await getSitemapEntries()).map((e) => e.path);
    expect(paths).toContain("/ekibimiz/dorduncu-avukat");
  });

  it("sitemap taslak, silinmiş ve zamanlanmış içeriği ASLA içermez", async () => {
    const paths = (await getSitemapEntries()).map((e) => e.path);
    expect(paths).toContain("/yayinlar/yayinda");
    expect(paths).toContain("/calisma-alanlari/alan-yayinda");
    expect(paths).toContain("/ekibimiz/aktif-avukat");
    for (const hidden of ["/yayinlar/taslak", "/yayinlar/silinmis", "/yayinlar/zamanlanmis", "/calisma-alanlari/alan-taslak", "/calisma-alanlari/alan-silinmis", "/ekibimiz/pasif-avukat", "/ekibimiz/silinmis-avukat"]) {
      expect(paths).not.toContain(hidden);
    }
    for (const fixed of ["/", "/hakkimizda", "/ekibimiz", "/calisma-alanlari", "/yayinlar", "/iletisim", "/kvkk", "/cerez-politikasi"]) {
      expect(paths).toContain(fixed);
    }
    expect(paths.some((p) => p.startsWith("/admin"))).toBe(false);
  });
});
