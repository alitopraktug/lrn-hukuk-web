#!/usr/bin/env node
/**
 * Herkese açık sitenin ÇEVRİMDIŞI (statik) kopyasını üretir — müşteri sunumu için.
 * Çıktı klasörü çift tıklayarak (file://) açılır; sunucu, veritabanı veya internet gerekmez.
 *
 *   npm run build && npm start          (başka bir terminalde; veritabanı + demo içerik hazır olmalı)
 *   npm run export:offline              → ./offline-demo klasörü
 *   node scripts/export-offline.mjs --base http://localhost:3000 --out ./offline-demo
 *
 * Ne yapar: sitemap'teki tüm sayfaları (ve keşfedilen kategori/sayfalama bağlantılarını) indirir; JavaScript'i çıkarır;
 * stil dosyalarını, görselleri ve yazı tiplerini (base64 gömülü) kopyalar; bağlantıları göreli yapar; küçük bir
 * `offline.js` ile mobil menü/kaydırma efekti/yazdırma çalışır. Yönetim paneli, iletişim formu ve arama ÇALIŞMAZ.
 * Herkese açık içerik dışında hiçbir veri (kullanıcı, mesaj, taslak) dışa aktarılmaz.
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : fallback;
};
const BASE = arg("base", "http://localhost:3000").replace(/\/$/, "");
const OUT = path.resolve(arg("out", "offline-demo"));
const IMG_WIDTH = 1024;

const decode = (s) => s.replace(/&amp;/g, "&").replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"');
const sha = (s) => crypto.createHash("sha1").update(s).digest("hex").slice(0, 10);
const MIME_EXT = { "image/webp": ".webp", "image/avif": ".avif", "image/png": ".png", "image/jpeg": ".jpg", "image/svg+xml": ".svg", "image/x-icon": ".ico", "image/vnd.microsoft.icon": ".ico" };
const FONT_MIME = { ".woff2": "font/woff2", ".woff": "font/woff", ".ttf": "font/ttf", ".otf": "font/otf" };

async function get(url) {
  const res = await fetch(url, { redirect: "follow" });
  return { res, buf: Buffer.from(await res.arrayBuffer()) };
}

async function asyncReplace(str, regex, fn) {
  const matches = [...str.matchAll(regex)];
  const parts = await Promise.all(matches.map((m) => fn(...m)));
  let i = 0;
  return str.replace(regex, () => parts[i++]);
}

/* ───────────── 1) Sayfaları keşfet ve indir ───────────── */
const keyFor = (href) => {
  const u = new URL(decode(href), BASE);
  const params = new URLSearchParams();
  for (const k of ["kategori", "sayfa"]) if (u.searchParams.has(k)) params.set(k, u.searchParams.get(k));
  const search = params.toString();
  return `${u.pathname.replace(/\/+$/, "") || "/"}${search ? `?${search}` : ""}`;
};

const fileForKey = (key) => {
  const [p, q] = key.split("?");
  const dir = (p === "/" ? "" : p.slice(1)) + (q ? `__${q.replace(/[^a-z0-9]+/gi, "-")}` : "");
  return dir ? `${dir}/index.html` : "index.html";
};

const SKIP_PATH = /^\/(admin|api|_next|brand|media)(\/|$)|\.(xml|txt|ico|png|jpe?g|webp|avif|svg|css|js|json)$/i;
const pages = new Map(); // key → html
const failed = [];

async function crawl() {
  const sm = await get(`${BASE}/sitemap.xml`);
  const seeds = ["/", "/yayinlar", ...[...sm.buf.toString().matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname)];
  const queue = [...new Set(seeds.map(keyFor))];
  const seen = new Set(queue);
  while (queue.length) {
    const key = queue.shift();
    const { res, buf } = await get(BASE + key);
    if (res.status !== 200) {
      failed.push(`${key} → ${res.status}`);
      continue;
    }
    const html = buf.toString("utf8");
    pages.set(key, html);
    for (const m of html.matchAll(/\shref="([^"]*)"/g)) {
      const href = decode(m[1]);
      if (!href.startsWith("/") || href.startsWith("//")) continue;
      const u = new URL(href, BASE);
      if (SKIP_PATH.test(u.pathname) || u.searchParams.has("q")) continue;
      const k = keyFor(href);
      if (!seen.has(k)) {
        seen.add(k);
        queue.push(k);
      }
    }
  }
}

/* ───────────── 2) Varlıkları yerelleştir ───────────── */
const assets = new Map(); // "pathname?search" → "assets/…"
function writeAsset(rel, buf) {
  const file = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, buf);
}

async function processCss(text, cssUrl) {
  return asyncReplace(text, /url\(\s*(['"]?)([^)'"]+)\1\s*\)/g, async (whole, _q, raw) => {
    if (raw.startsWith("data:") || raw.startsWith("#")) return whole;
    const abs = new URL(decode(raw), cssUrl); // yollar CSS dosyasının konumuna göre çözülür
    const { res, buf } = await get(abs.toString());
    if (res.status !== 200) return whole;
    const ext = path.extname(abs.pathname).toLowerCase();
    const mime = FONT_MIME[ext] ?? res.headers.get("content-type") ?? "application/octet-stream";
    return `url(data:${mime};base64,${buf.toString("base64")})`; // yazı tipleri/görseller CSS'e gömülür (file:// CORS sorunu yok)
  });
}

async function localize(rawUrl) {
  const u = new URL(decode(rawUrl), BASE);
  if (u.origin !== new URL(BASE).origin) return null;
  let target = u;
  if (u.pathname === "/_next/image") {
    const inner = u.searchParams.get("url");
    if (!inner) return null;
    target = new URL(`/_next/image?url=${encodeURIComponent(inner)}&w=${IMG_WIDTH}&q=75`, BASE);
  }
  const key = target.pathname + target.search;
  if (assets.has(key)) return assets.get(key);

  const { res, buf } = await get(target.toString());
  if (res.status !== 200) {
    failed.push(`${key} → ${res.status}`);
    assets.set(key, null);
    return null;
  }
  const type = (res.headers.get("content-type") ?? "").split(";")[0];
  let rel;
  if (type === "text/css") {
    rel = `assets/css/${sha(key)}.css`;
    writeAsset(rel, Buffer.from(await processCss(buf.toString("utf8"), target.toString())));
  } else if (u.pathname.startsWith("/brand/")) {
    rel = `assets/brand/${path.basename(u.pathname)}`;
    writeAsset(rel, buf);
  } else {
    rel = `assets/img/${sha(key)}${MIME_EXT[type] ?? path.extname(u.pathname) ?? ""}`;
    writeAsset(rel, buf);
  }
  assets.set(key, rel);
  return rel;
}

/* ───────────── 3) HTML'i yeniden yaz ───────────── */
const pageFiles = new Map([...pages.keys()].map((k) => [k, fileForKey(k)]));
let deadLinks = 0;

async function rewrite(key, html) {
  const file = fileForKey(key);
  const dir = path.posix.dirname(file);
  const up = dir === "." ? "./" : "../".repeat(dir.split("/").length);
  const rel = (assetRel) => up + assetRel;

  // JavaScript ve ön yükleme ipuçları çıkarılır (JSON-LD kalır)
  html = html.replace(/<script\b(?![^>]*application\/ld\+json)[^>]*>[\s\S]*?<\/script>/gi, "");
  html = html.replace(/<link\b[^>]*\brel="(?:preload|prefetch|modulepreload|preconnect|dns-prefetch)"[^>]*>/gi, "");
  // Çevrimdışı kopyada kanonik/OG/robots yerel adresi göstermesin; arama motorlarına kapalı
  html = html.replace(/<link\b[^>]*\brel="canonical"[^>]*>/gi, "");
  html = html.replace(/<meta\b[^>]*(?:property="og:|name="twitter:|name="robots")[^>]*>/gi, "");
  html = html.replace(/<head>/i, '<head><meta name="robots" content="noindex,nofollow"/>');

  // Stil dosyaları
  html = await asyncReplace(html, /<link\b[^>]*\brel="stylesheet"[^>]*>/gi, async (tag) => {
    const href = tag.match(/\shref="([^"]*)"/)?.[1];
    const local = href ? await localize(href) : null;
    return local ? `<link rel="stylesheet" href="${rel(local)}"/>` : "";
  });

  // Simgeler
  html = await asyncReplace(html, /<link\b[^>]*\brel="(?:icon|shortcut icon|apple-touch-icon)"[^>]*>/gi, async (tag) => {
    const href = tag.match(/\shref="([^"]*)"/)?.[1];
    const local = href ? await localize(href) : null;
    return local ? tag.replace(/\shref="[^"]*"/, ` href="${rel(local)}"`) : "";
  });

  // Görseller (next/image → tek boyutlu yerel dosya)
  html = await asyncReplace(html, /<img\b[^>]*>/gi, async (tag) => {
    const src = tag.match(/\ssrc="([^"]*)"/)?.[1];
    if (!src || src.startsWith("data:")) return tag;
    const local = await localize(src);
    if (!local) return tag;
    return tag
      .replace(/\ssrc="[^"]*"/, ` src="${rel(local)}"`)
      .replace(/\s(?:srcSet|srcset|sizes)="[^"]*"/g, "");
  });

  // Bağlantılar
  html = html.replace(/(<a\b[^>]*?\shref=")([^"]*)(")/gi, (_m, a, raw, c) => {
    const href = decode(raw);
    if (href.startsWith("#") || /^(mailto:|tel:|https?:|\/\/)/i.test(href)) return a + raw + c;
    if (!href.startsWith("/")) return a + raw + c;
    const hash = href.includes("#") ? `#${href.split("#")[1]}` : "";
    const target = pageFiles.get(keyFor(href.split("#")[0]));
    if (!target) {
      deadLinks++;
      return `${a}#${c}`;
    }
    const relative = path.posix.relative(dir, target) || "index.html";
    return a + relative + hash + c;
  });

  // Formlar (sunucu gerektirir): eylem etkisizleştirilir, offline.js kullanıcıyı bilgilendirir
  html = html.replace(/(<form\b[^>]*?\saction=")[^"]*(")/gi, "$1#$2");

  // Yardımcı betik (yalnızca bu dosya çalışır)
  html = html.replace(/<\/body>/i, `<script src="${rel("assets/offline.js")}" defer></script></body>`);
  return { file, html };
}

/* ───────────── 4) offline.js ve BENİ-OKU ───────────── */
const OFFLINE_JS = `(function () {
  var d = document;
  // Mobil menü (yerel <dialog>)
  var btn = d.querySelector('button[aria-controls="mobile-menu"]');
  var dlg = d.getElementById('mobile-menu');
  if (btn && dlg && dlg.showModal) {
    btn.addEventListener('click', function () { dlg.showModal(); btn.setAttribute('aria-expanded', 'true'); });
    dlg.addEventListener('close', function () { btn.setAttribute('aria-expanded', 'false'); });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
    dlg.querySelectorAll('button').forEach(function (b) { if (/kapat/i.test(b.textContent)) b.addEventListener('click', function () { dlg.close(); }); });
  }
  // Üst menü: kaydırınca hafif bulanık zemin
  var h = d.querySelector('[data-site-header]');
  if (h) {
    var on = 'border-line bg-background/85 backdrop-blur-md'.split(' ');
    var off = 'border-transparent bg-background'.split(' ');
    var update = function () {
      var s = window.scrollY > 8;
      on.forEach(function (c) { h.classList.toggle(c, s); });
      off.forEach(function (c) { h.classList.toggle(c, !s); });
    };
    window.addEventListener('scroll', update, { passive: true });
    update();
  }
  // Sunucu gerektiren formlar
  d.querySelectorAll('form').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      alert('Bu, çevrimdışı bir örnek kopyadır.\\nİletişim formu ve arama yalnızca yayındaki sitede çalışır.');
    });
  });
  // Yazdır / bağlantıyı kopyala
  d.querySelectorAll('button').forEach(function (b) {
    var t = (b.textContent || '').trim();
    if (t === 'Yazdır') b.addEventListener('click', function () { window.print(); });
    if (t === 'Bağlantıyı Kopyala') b.addEventListener('click', function () {
      try { navigator.clipboard.writeText(location.href); } catch (e) {}
    });
  });
  // Bilgi etiketi
  var st = d.createElement('style');
  st.textContent = '@media print{.offline-badge{display:none!important}}';
  d.head.appendChild(st);
  var badge = d.createElement('button');
  badge.className = 'offline-badge';
  badge.type = 'button';
  badge.textContent = 'Çevrimdışı örnek kopya · kapat';
  badge.setAttribute('style', 'position:fixed;left:12px;bottom:12px;z-index:9999;background:#181918;color:#f5f1ea;border:0;border-radius:999px;padding:7px 14px;font:600 12px/1 system-ui,sans-serif;opacity:.82;cursor:pointer');
  badge.addEventListener('click', function () { badge.remove(); });
  d.body.appendChild(badge);
})();
`;

const README_TXT = `LRN HUKUK — ÇEVRİMDIŞI ÖRNEK KOPYA
====================================

Nasıl açılır?
  1) ZIP dosyasını bir klasöre çıkarın (sağ tık → "Tümünü ayıkla").
  2) "index.html" dosyasına çift tıklayın. Herhangi bir tarayıcı yeterlidir (Chrome, Edge, Firefox, Safari).
  İnternet, sunucu veya kurulum GEREKMEZ.

Bu kopyada neler var?
  - Sitenin tüm herkese açık sayfaları: Ana Sayfa, Hakkımızda, Ekibimiz (profil sayfalarıyla),
    7 Çalışma Alanı, Yayınlar (makale sayfalarıyla), İletişim, KVKK/Çerez/Gizlilik/Kullanım metinleri.
  - Mobil menü, kaydırma efektleri, yazdırma ve tüm tasarım aynen çalışır. Telefon görünümünü görmek için
    tarayıcı penceresini daraltın.

Neler ÇALIŞMAZ? (yalnızca yayındaki sistemde çalışır)
  - Yönetim paneli (/admin), iletişim formunun gönderimi ve yayın araması.

Önemli notlar
  - İçerik "DEMO İÇERİK"tir: profil adları, yazılar ve metinler tasarımı göstermek için yer tutucudur.
  - Adres, telefon, e-posta, avukat bilgileri ve hukuki metinler (KVKK, çerez vb.) yayına alınmadan önce
    LRN Hukuk tarafından yönetim panelinden girilecek/onaylanacaktır.
  - Logo, verilen logonun vektör hâlidir; nihai logo ayrıca hazırlanacaktır.
`;

/* ───────────── çalıştır ───────────── */
console.log(`Çevrimdışı kopya: ${BASE} → ${OUT}`);
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

await crawl();
for (const k of pages.keys()) pageFiles.set(k, fileForKey(k));

let count = 0;
for (const [key, html] of pages) {
  const { file, html: out } = await rewrite(key, html);
  const target = path.join(OUT, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, out);
  count++;
}
writeAsset("assets/offline.js", Buffer.from(OFFLINE_JS));
fs.writeFileSync(path.join(OUT, "BENI-OKU.txt"), String.fromCharCode(0xfeff) + README_TXT.replace(/\n/g, "\r\n"));

const size = (dir) => fs.readdirSync(dir, { withFileTypes: true }).reduce((n, e) => n + (e.isDirectory() ? size(path.join(dir, e.name)) : fs.statSync(path.join(dir, e.name)).size), 0);
console.log(`${count} sayfa, ${[...assets.values()].filter(Boolean).length} varlık, ${(size(OUT) / 1024 / 1024).toFixed(1)} MB`);
if (deadLinks) console.log(`Uyarı: ${deadLinks} bağlantı çevrimdışı kopyada hedefsiz ('#' yapıldı).`);
if (failed.length) console.log("İndirilemeyenler:\n  " + failed.join("\n  "));
console.log(`Hazır: ${path.join(OUT, "index.html")}`);
