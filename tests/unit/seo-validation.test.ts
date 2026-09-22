import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { proxy } from "@/proxy";
import { breadcrumbLd, articleLd, jsonLd, organizationLd, personLd } from "@/lib/jsonld";
import { buildMetadata } from "@/lib/seo";
import { contactSchema } from "@/lib/validation/contact";
import { areaSchema, parseTagNames, publicationSchema, settingsSchema, teamSchema } from "@/lib/validation/admin";
import type { SiteSettingsView } from "@/lib/data/site";
import type { PublicationDetail } from "@/lib/data/publications";
import type { TeamDetail } from "@/lib/data/team";

const site = { firmName: "LRN Hukuk", defaultTitle: "LRN Hukuk | Ankara", defaultDescription: "Ankara merkezli hukuk bürosu.", ogImage: null };

const settings = (over: Partial<SiteSettingsView> = {}): SiteSettingsView => ({
  firmName: "LRN Hukuk",
  logo: null,
  favicon: null,
  ogImage: null,
  phone: "",
  email: "",
  address: "",
  mapEmbedUrl: "",
  workingHours: "",
  social: { linkedin: "", instagram: "", x: "", facebook: "" },
  footerText: "",
  defaultTitle: "LRN Hukuk | Ankara",
  defaultDescription: "Açıklama",
  gaMeasurementId: "",
  googleSiteVerification: "",
  publicationDisclaimer: "",
  contactNotice: "",
  contactConsentLabel: "",
  contactRecipientEmail: "",
  storeContactMessages: true,
  messageRetentionDays: 365,
  ...over,
});

describe("metadata", () => {
  it("kanonik adres, OG ve Twitter alanlarını üretir", () => {
    const m = buildMetadata({ title: "Ceza Hukuku", description: "Kısa açıklama", path: "/calisma-alanlari/ceza-hukuku" }, site);
    expect(m.title).toBe("Ceza Hukuku");
    expect(m.alternates?.canonical).toBe("https://www.example.test/calisma-alanlari/ceza-hukuku");
    expect(m.openGraph).toMatchObject({ locale: "tr_TR", siteName: "LRN Hukuk", url: "https://www.example.test/calisma-alanlari/ceza-hukuku" });
    expect(m.twitter).toMatchObject({ card: "summary_large_image" });
    expect(m.robots).toEqual({ index: true, follow: true });
  });

  it("panelden girilen SEO başlığı olduğu gibi kullanılır; ana sayfa mutlak başlık alır", () => {
    const m = buildMetadata({ title: "X", seoTitle: "Özel Başlık | LRN Hukuk", path: "/x" }, site);
    expect(m.title).toEqual({ absolute: "Özel Başlık | LRN Hukuk" });
    const home = buildMetadata({ path: "/", absoluteTitle: true, title: site.defaultTitle }, site);
    expect(home.title).toEqual({ absolute: "LRN Hukuk | Ankara" });
  });

  it("OG görseli yoksa kurumsal varsayılan görsel kullanılır; noindex desteklenir", () => {
    const m = buildMetadata({ title: "Arama", path: "/yayinlar", noindex: true }, site);
    expect((m.openGraph as { images: { url: string }[] }).images[0].url).toBe("https://www.example.test/brand/og-default.png");
    expect(m.robots).toEqual({ index: false, follow: false });
  });

  it("makale meta verisi yayın ve güncelleme tarihlerini içerir", () => {
    const d = new Date("2026-03-01T10:00:00Z");
    const m = buildMetadata({ title: "Yazı", path: "/yayinlar/yazi", type: "article", publishedTime: d, modifiedTime: d, authors: ["LRN Hukuk"] }, site);
    expect(m.openGraph).toMatchObject({ type: "article", publishedTime: d.toISOString(), authors: ["LRN Hukuk"] });
  });
});

describe("yapılandırılmış veri (JSON-LD)", () => {
  it("rating/review/award ALANLARI HİÇBİR ŞEKİLDE üretilmez", () => {
    const pub = { id: "1", slug: "a", title: "Başlık", excerpt: "Özet", content: "<p>x</p>", publishedAt: new Date(), updatedAt: new Date(), readingMinutes: 1, featured: false, category: { id: "c", name: "Genel", slug: "genel" }, tags: [], cover: null, ogImage: null, seoTitle: null, seoDescription: null, author: { name: "LRN Hukuk", slug: null }, areaIds: [] } satisfies PublicationDetail;
    const member = { id: "1", slug: "ad", fullName: "Ad Soyad", title: "Avukat", shortBio: "Kısa", photoPosition: "50% 25%", photo: null, bio: "", education: [], barAssociation: null, tbbNo: null, barNo: null, careerStart: null, languages: [], writings: [], email: null, linkedin: null, hiddenFields: [], seoTitle: null, seoDescription: null, updatedAt: new Date(), practiceAreas: [], ogImage: null } satisfies TeamDetail;
    const all = JSON.stringify([organizationLd(settings({ address: "Çankaya/Ankara", phone: "0312", email: "a@b.co" })), articleLd(pub), personLd(member), breadcrumbLd([{ name: "A", path: "/a" }])]);
    expect(all).not.toMatch(/aggregateRating|"review"|"award"|ratingValue/i);
    expect(all).toContain("LegalService");
  });

  it("adres/iletişim yoksa genel Organization, varsa LegalService üretir", () => {
    expect(organizationLd(settings())["@type"]).toBe("Organization");
    expect(organizationLd(settings({ address: "x", phone: "1" }))["@type"]).toBe("LegalService");
  });

  it("jsonLd </script> kırılmasını önler", () => {
    expect(jsonLd({ a: "</script><script>alert(1)</script>" })).not.toContain("</script>");
  });
});

describe("proxy (yönetim paneli ön koruması)", () => {
  it("oturum çerezi olmayan /admin isteğini girişe yönlendirir", () => {
    const res = proxy(new NextRequest("https://www.example.test/admin/yayinlar?x=1"));
    expect(res.status).toBe(307);
    const loc = new URL(res.headers.get("location")!);
    expect(loc.pathname).toBe("/admin/login");
    expect(loc.searchParams.get("next")).toBe("/admin/yayinlar?x=1");
  });

  it("giriş ve parola sıfırlama sayfaları oturumsuz açılır; çerezli istek geçer", () => {
    expect(proxy(new NextRequest("https://www.example.test/admin/login")).status).toBe(200);
    expect(proxy(new NextRequest("https://www.example.test/admin/sifremi-unuttum")).status).toBe(200);
    const withCookie = new NextRequest("https://www.example.test/admin", { headers: { cookie: "__Host-lrn_session=abc" } });
    expect(proxy(withCookie).status).toBe(200);
  });

  it("herkese açık sayfalara dokunmaz", () => {
    expect(proxy(new NextRequest("https://www.example.test/yayinlar")).status).toBe(200);
  });

  it("http → https yönlendirmesi yapar", () => {
    const res = proxy(new NextRequest("https://www.example.test/iletisim", { headers: { "x-forwarded-proto": "http", host: "www.example.test" } }));
    expect(res.status).toBe(308);
    expect(res.headers.get("location")).toBe("https://www.example.test/iletisim");
  });
});

describe("iletişim formu şeması", () => {
  const valid = { name: "Ayşe Yılmaz", email: "ayse@ornek.com", phone: "0312 000 00 00", subject: "Genel bilgi", message: "Merhaba, bilgi almak istiyorum.", consent: "on" };

  it("geçerli girdiyi kabul eder", () => {
    expect(contactSchema.safeParse(valid).success).toBe(true);
    expect(contactSchema.safeParse({ ...valid, phone: undefined }).success).toBe(true);
  });

  it.each([
    ["ad", { name: "A" }],
    ["e-posta", { email: "gecersiz" }],
    ["konu", { subject: "ab" }],
    ["kısa mesaj", { message: "kısa" }],
    ["uzun mesaj", { message: "x".repeat(4001) }],
    ["telefon", { phone: "<script>" }],
    ["onay yok", { consent: undefined }],
    ["kontrol karakteri", { name: "Ali" + String.fromCharCode(0) + "Veli" }],
  ])("reddeder: %s", (_label, over) => {
    expect(contactSchema.safeParse({ ...valid, ...over }).success).toBe(false);
  });
});

describe("yönetim form şemaları", () => {
  it("yayın: başlık zorunlu, slug biçimi ve tarih dönüşümü (UTC+3)", () => {
    expect(publicationSchema.safeParse({ title: "" }).success).toBe(false);
    expect(publicationSchema.safeParse({ title: "Yazı", slug: "Kötü Slug!" }).success).toBe(false);
    const ok = publicationSchema.parse({ title: "  Yazı  ", slug: "yazi", publishedAt: "2026-05-01T12:00" });
    expect(ok.title).toBe("Yazı");
    expect(ok.publishedAt?.toISOString()).toBe("2026-05-01T09:00:00.000Z");
    expect(publicationSchema.safeParse({ title: "Yazı", publishedAt: "bozuk" }).success).toBe(false);
    expect(publicationSchema.parse({ title: "Yazı" }).intent).toBe("save");
  });

  it("etiketler tekilleştirilir ve en fazla 10 olur", () => {
    expect(parseTagNames("iş, İş , ceza,,  aile")).toEqual(["iş", "ceza", "aile"]);
    expect(parseTagNames(Array.from({ length: 30 }, (_, i) => `t${i}`).join(",")).length).toBe(10);
  });

  it("çalışma alanı: konu satırları diziye çevrilir", () => {
    expect(areaSchema.parse({ title: "Alan", topics: "a\n\nb\n c " }).topics).toEqual(["a", "b", "c"]);
  });

  it("ekip: e-posta/LinkedIn/kadraj doğrulanır", () => {
    const base = { fullName: "Ad Soyad", title: "Avukat" };
    expect(teamSchema.safeParse({ ...base, email: "gecersiz" }).success).toBe(false);
    expect(teamSchema.safeParse({ ...base, linkedin: "javascript:alert(1)" }).success).toBe(false);
    expect(teamSchema.safeParse({ ...base, photoPosition: "50% 25%; background:url(x)" }).success).toBe(false);
    expect(teamSchema.safeParse({ ...base, careerStart: "2015-13-45" }).success).toBe(false);
    expect(teamSchema.parse({ ...base, careerStart: "2015-09-01", visible: "education" }).visible).toEqual(["education"]);
  });

  it("ayarlar: harita adresi yalnızca bilinen sağlayıcılardan; GA kimliği biçimi", () => {
    const base = { firmName: "LRN Hukuk", messageRetentionDays: "365" };
    expect(settingsSchema.safeParse({ ...base, mapEmbedUrl: "https://kotu.example/embed" }).success).toBe(false);
    expect(settingsSchema.safeParse({ ...base, mapEmbedUrl: "https://www.google.com/maps/embed?pb=1" }).success).toBe(true);
    expect(settingsSchema.safeParse({ ...base, gaMeasurementId: "UA-1" }).success).toBe(false);
    expect(settingsSchema.parse({ ...base, gaMeasurementId: "g-abc123xyz" }).gaMeasurementId).toBe("G-ABC123XYZ");
    expect(settingsSchema.safeParse({ ...base, messageRetentionDays: "5" }).success).toBe(false);
  });
});
