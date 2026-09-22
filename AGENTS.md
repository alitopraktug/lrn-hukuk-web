<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# LRN Hukuk — proje rehberi (insan ve yapay zekâ geliştiriciler için)

Ankara merkezli LRN Hukuk için Next.js 16 (App Router) + PostgreSQL + Prisma 7 kurumsal sitesi ve yönetim paneli.
Ayrıntılı kurulum/dağıtım: `README.md`.

## Komutlar
`npm run dev` · `npm run lint` · `npm run typecheck` · `npm test` (birim + PostgreSQL entegrasyon) · `npm run build` · `npm run test:smoke` (çalışan sunucuya karşı)
Yerel veritabanı: `npm run db:dev` (gömülü PostgreSQL) → `npm run db:migrate` → `npm run db:seed` (`db:seed:demo` yalnızca geliştirme).
Yönetici oluşturma: `npm run admin:create -- --email … --name "…"`.

## Mimari (kısa)
- `app/(public)` herkese açık site (ISR, `revalidate = 300`); `app/admin/(auth)` giriş; `app/admin/(panel)` yönetim (her sayfa `requireUser()`, her eylem `guard()` çağırır).
- `lib/data/*` herkese açık okuma katmanı — **taslak/silinmiş/zamanlanmış içerik filtresi yalnızca `lib/data/where.ts` içinde** tanımlıdır; yeni sorgular bunu kullanmalıdır.
- `lib/auth/*` oturum (DB'de SHA-256 özetli token), scrypt parola, TOTP 2FA, hız sınırı (`lib/rate-limit.ts`, PostgreSQL). Auth.js kullanılmaz (gerekçe README'de).
- `lib/admin/helpers.ts` → `revalidateSite()`: içerik değişince tüm herkese açık önbelleği geçersiz kılar. Her admin eylemi sonunda çağrılmalıdır.
- Zengin metin HER ZAMAN `sanitizeRichText` ile kaydedilir ve `prepareRichText` ile gösterilir; ham HTML doğrudan render edilmez.
- Medya baytları PostgreSQL'de (`MediaBlob`); `/media/[id]` üzerinden servis edilir; yüklemeler `lib/media/process.ts` ile doğrulanıp yeniden kodlanır.

## Değişmez kurallar (avukatlık meslek kuralları ve marka)
- **Reklam/iddia dili YOK:** "en iyi", "uzman", "başarı oranı", "garanti", "kazanıyoruz", müvekkil yorumu, referans/logo, ödül, rakip karşılaştırması, satış odaklı CTA eklenmez. JSON-LD'ye `rating/review/aggregateRating/award` eklenmez.
- Gerçek kişi adı, telefon, adres, e-posta, sicil no, üniversite, yayın **uydurulmaz**; bunlar panelden girilir. Demo kayıtlar `isDemo` ile işaretlenir ve metinlerinde "Demo İçerik" yazar.
- Hukuki metinler (KVKK, çerez, gizlilik, kullanım koşulları) **yer tutucudur**; LRN Hukuk'un hukukçusu onaylamadan yayına alınmamalıdır (`Page.reviewedAt`).
- Klişe hukuk görselleri (terazi, tokmak, Themis, sütun, mahkeme salonu) ve lacivert-altın palet kullanılmaz. **Ana kombinasyon ivory + charcoal + bordodur** (`--background`/`--foreground`/`--ink` + `--wine`); bordo yalnızca küçük vurgularda (çizgi, hover, link, aktif durum, bölüm numarası) kullanılır. `--forest` (logo yeşili) opsiyoneldir, nadiren/hiç kullanılmaz — "sessiz lüks" hissi renkten değil tipografi/boşluk/oranlardan gelir. Renkleri bileşenlerde sabit yazmayın; `app/globals.css` belirteçlerini kullanın. Kart ızgarası/badge/pill/gradient/glassmorphism/aşırı gölge/8px üzeri border-radius kullanılmaz; editoryal satır/liste düzeni tercih edilir (bkz. `components/practice/practice-area-list.tsx`).
- Herkese açık sayfalarda tek `<h1>`; başlık hiyerarşisi bozulmaz; her etkileşimli öğe klavye ile erişilebilir ve odağı görünür olmalıdır.

## Dikkat edilecekler
- Yeni sunucu eylemi: `"use server"` dosyaları yalnızca async fonksiyon export eder; önce `guard(permission)`, sonra Zod ile doğrulama (`lib/validation/*`), sonra yazma + `audit()` + `revalidateSite()`.
- Formlarda React 19 form sıfırlaması yazılanları silmesin diye `components/admin/use-server-form.ts` kullanılır.
- Kaynak dosyalarda `\uXXXX` ile kontrol/birleştirici karakter yazmayın (`\x..`, `\p{M}` kullanın) — ham kontrol karakterleri kaynak koda sızabilir.
- `next build` veritabanına erişir; derleme sırasında `DATABASE_URL` erişilebilir olmalıdır.
