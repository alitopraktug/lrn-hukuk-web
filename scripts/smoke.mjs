#!/usr/bin/env node
/**
 * Çalışan bir sunucuya (varsayılan http://localhost:3000) karşı uçtan uca "duman testi".
 *
 *   npm run build && npm start        (başka bir terminalde)
 *   npm run test:smoke
 *   BASE_URL=https://alanadi.com npm run test:smoke      (yayındaki siteyi denetlemek için)
 *
 * Denetlenenler: genel rotalar, 404, yönetim paneli koruması, güvenlik başlıkları, sitemap/robots,
 * her sayfada tek H1 / lang / canonical / OG / JSON-LD, sağlık ucu.
 */
const BASE = (process.env.BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");
let failed = 0;
let passed = 0;

const ok = (name) => {
  passed++;
  console.log(`  ✓ ${name}`);
};
const fail = (name, detail) => {
  failed++;
  console.log(`  ✗ ${name}${detail ? `\n      ${detail}` : ""}`);
};
const check = (name, cond, detail) => (cond ? ok(name) : fail(name, detail));
const get = (path, init = {}) => fetch(BASE + path, { redirect: "manual", ...init });

async function main() {
  console.log(`\nDuman testi: ${BASE}\n`);

  console.log("Genel sayfalar");
  const home = await get("/");
  const areaSlugs = ["is-ve-sosyal-guvenlik-hukuku", "ceza-hukuku", "saglik-hukuku", "sirketler-hukuku", "ticaret-hukuku", "aile-hukuku", "idare-hukuku"];
  const pages = ["/", "/hakkimizda", "/ekibimiz", "/calisma-alanlari", ...areaSlugs.map((s) => `/calisma-alanlari/${s}`), "/yayinlar", "/iletisim", "/kvkk", "/cerez-politikasi", "/gizlilik", "/kullanim-kosullari"];
  for (const p of pages) {
    const res = await get(p);
    const html = await res.text();
    if (res.status !== 200) {
      fail(`${p} → 200`, `alınan: ${res.status}`);
      continue;
    }
    const h1s = (html.match(/<h1[\s>]/g) ?? []).length;
    const problems = [];
    if (h1s !== 1) problems.push(`H1 sayısı ${h1s}`);
    if (!/<html[^>]*lang="tr"/.test(html)) problems.push("lang=tr yok");
    if (!/<link[^>]+rel="canonical"/.test(html)) problems.push("canonical yok");
    if (!/property="og:title"/.test(html)) problems.push("og:title yok");
    if (!/name="description"/.test(html)) problems.push("meta description yok");
    if (!/application\/ld\+json/.test(html)) problems.push("JSON-LD yok");
    if (/lorem ipsum/i.test(html)) problems.push("lorem ipsum");
    check(`${p} → 200, tek H1, lang, canonical, OG, JSON-LD`, problems.length === 0, problems.join("; "));
  }

  console.log("\nÖzel 404");
  const nf = await get("/bu-sayfa-yok-12345");
  const nfHtml = await nf.text();
  check("bilinmeyen adres → 404", nf.status === 404);
  check("404 sayfası Türkçe mesaj içerir", nfHtml.includes("Aradığınız sayfa bulunamadı."));
  check("404 sayfası noindex", /noindex/.test(nfHtml));
  const nfArticle = await get("/yayinlar/bu-yayin-yok");
  check("olmayan yayın → 404", nfArticle.status === 404);
  const nfTeam = await get("/ekibimiz/bu-kisi-yok");
  check("olmayan profil → 404", nfTeam.status === 404);

  console.log("\nYönetim paneli koruması");
  for (const p of ["/admin", "/admin/yayinlar", "/admin/yayinlar/yeni", "/admin/ekip", "/admin/ayarlar", "/admin/kullanicilar", "/admin/sistem"]) {
    const res = await get(p);
    const loc = res.headers.get("location") ?? "";
    check(`${p} oturumsuz → girişe yönlendirir`, [302, 303, 307, 308].includes(res.status) && loc.includes("/admin/login"), `durum ${res.status} ${loc}`);
  }
  const login = await get("/admin/login");
  check("/admin/login → 200", login.status === 200);
  check("/admin/* yanıtlarında X-Robots-Tag: noindex", /noindex/i.test(login.headers.get("x-robots-tag") ?? ""));
  check("/admin/* önbelleğe alınmaz", /no-store/i.test(login.headers.get("cache-control") ?? ""));
  const reg = await get("/register");
  const adminReg = await get("/admin/register");
  check("/register herkese açık değil (404)", reg.status === 404);
  check("/admin/register sayfası yok (girişe yönlendirir veya 404)", adminReg.status === 404 || (adminReg.headers.get("location") ?? "").includes("/admin/login"));
  const upload = await get("/admin/api/media", { method: "GET" });
  check("/admin/api/media oturumsuz → engellenir", [401, 302, 307].includes(upload.status), `durum ${upload.status}`);
  const exportRes = await get("/admin/api/export?type=content");
  check("/admin/api/export oturumsuz → engellenir", [401, 302, 307].includes(exportRes.status), `durum ${exportRes.status}`);
  const uploadPost = await get("/admin/api/media", { method: "POST", body: new FormData(), headers: { origin: "https://kotu.example" } });
  check("yükleme: farklı origin / oturumsuz POST reddedilir", [401, 403, 302, 307].includes(uploadPost.status), `durum ${uploadPost.status}`);
  check("/api/cron/maintenance gizli anahtarsız → 401", (await get("/api/cron/maintenance")).status === 401);

  console.log("\nGüvenlik başlıkları (/)");
  const h = home.headers;
  const csp = h.get("content-security-policy") ?? "";
  check("Content-Security-Policy var", csp.length > 0);
  check("CSP: 'unsafe-eval' yok (üretim)", !/unsafe-eval/.test(csp) || BASE.includes("localhost:3001"), csp.match(/script-src[^;]*/)?.[0]);
  check("CSP: object-src 'none', frame-ancestors 'none', base-uri 'self'", /object-src 'none'/.test(csp) && /frame-ancestors 'none'/.test(csp) && /base-uri 'self'/.test(csp));
  check("X-Content-Type-Options: nosniff", h.get("x-content-type-options") === "nosniff");
  check("Referrer-Policy", Boolean(h.get("referrer-policy")));
  check("Permissions-Policy", Boolean(h.get("permissions-policy")));
  check("X-Frame-Options: DENY", h.get("x-frame-options") === "DENY");
  check("X-Powered-By yok", !h.get("x-powered-by"));
  if (BASE.startsWith("https://")) check("Strict-Transport-Security", Boolean(h.get("strict-transport-security")));

  console.log("\nSitemap ve robots");
  const sm = await (await get("/sitemap.xml")).text();
  const locs = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  check("sitemap.xml sayfaları listeler", locs.length >= 15, `${locs.length} adres`);
  check("sitemap /admin içermez", !locs.some((l) => l.includes("/admin")));
  check("sitemap'teki 7 çalışma alanı adresi var", areaSlugs.every((s) => locs.some((l) => l.endsWith(`/calisma-alanlari/${s}`))));
  let bad = 0;
  for (const l of locs) {
    const u = new URL(l);
    const r = await get(u.pathname);
    if (r.status !== 200) {
      bad++;
      console.log(`      ${u.pathname} → ${r.status}`);
    }
  }
  check("sitemap'teki tüm adresler 200 döner", bad === 0, `${bad} hatalı`);
  const robots = await (await get("/robots.txt")).text();
  check("robots.txt /admin'i engeller ve sitemap'i gösterir", /Disallow: \/admin/.test(robots) && /Sitemap:/.test(robots));

  console.log("\nSağlık ve medya");
  const health = await get("/api/health");
  check("/api/health → 200 {status:ok}", health.status === 200 && (await health.json()).status === "ok");
  check("/media/gecersiz → 404", (await get("/media/gecersiz")).status === 404);
  const icon = await get("/brand/favicon.ico");
  check("favicon.ico erişilebilir", icon.status === 200);
  const og = await get("/brand/og-default.png");
  check("varsayılan OG görseli erişilebilir", og.status === 200 && (og.headers.get("content-type") ?? "").includes("image/png"));

  console.log(`\n${passed} başarılı, ${failed} başarısız\n`);
  process.exit(failed ? 1 : 0);
}

main().catch((e) => {
  console.error("Duman testi çalıştırılamadı:", e.message);
  process.exit(2);
});
