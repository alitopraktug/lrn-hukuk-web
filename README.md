# LRN Hukuk — Kurumsal Web Sitesi ve Yönetim Paneli

Ankara merkezli **LRN Hukuk** için sıfırdan geliştirilmiş; herkese açık kurumsal site, PostgreSQL tabanlı içerik yönetim paneli, güvenli kimlik doğrulama, iletişim formu, SEO altyapısı ve dağıtım dokümantasyonundan oluşan eksiksiz bir projedir.

> **Önemli — yayına almadan önce:** KVKK Aydınlatma Metni, Çerez Politikası, Gizlilik ve Kullanım Koşulları metinleri **yer tutucudur** ve hukuki tavsiye değildir. LRN Hukuk'un hukukçusu tarafından kontrol edilip tamamlanmalıdır. Sitedeki tüm metinlerin Türkiye Barolar Birliği reklam yasağı düzenlemelerine uygunluğu da büro tarafından ayrıca gözden geçirilmelidir (bkz. [Meslek kuralları](#meslek-kurallarına-uygunluk-notları)). Panelin ana sayfasındaki **"Yayına hazırlık"** listesi bu adımları takip eder.

## İçindekiler

1. [Proje nedir](#1-proje-nedir)
2. [Teknolojiler](#2-teknolojiler)
3. [Yerel kurulum (5 dakika)](#3-yerel-kurulum)
4. [Ortam değişkenleri](#4-ortam-değişkenleri)
5. [Veritabanı kurulumu](#5-veritabanı-kurulumu)
6. [Migrasyon](#6-migrasyon)
7. [Seed (başlangıç verisi)](#7-seed-başlangıç-verisi)
8. [Yönetici kullanıcı oluşturma](#8-yönetici-kullanıcı-oluşturma)
9. [Geliştirme](#9-geliştirme)
10. [Üretim derlemesi](#10-üretim-derlemesi)
11. [Dağıtım (Vercel / VPS / Docker)](#11-dağıtım)
12. [Alan adı bağlama](#12-alan-adı-bağlama)
13. [SSL / HTTPS](#13-ssl--https)
14. [SMTP ve kurumsal e-posta](#14-smtp-ve-kurumsal-e-posta)
15. [Google Analytics](#15-google-analytics)
16. [Google Search Console](#16-google-search-console)
17. [Harita](#17-harita)
18. [Yedekleme ve geri yükleme](#18-yedekleme-ve-geri-yükleme)
19. [Güvenlik](#19-güvenlik)
20. [İçerik yönetimi (genel bakış)](#20-i̇çerik-yönetimi)
21. [Logo değiştirme](#21-logo-değiştirme)
22. [Renkleri ve tipografiyi değiştirme](#22-renkleri-ve-tipografiyi-değiştirme)
23. [Ekip ekleme](#23-ekip-ekleme)
24. [Makale ekleme](#24-makale-ekleme)
25. [Çalışma alanı ekleme](#25-çalışma-alanı-ekleme)
26. [**Yönetim Paneli Kullanımı** (teknik olmayan ekip için)](#26-yönetim-paneli-kullanımı)
27. [Meslek kurallarına uygunluk notları](#meslek-kurallarına-uygunluk-notları)
28. [KVKK, çerez ve gizlilik](#kvkk-çerez-ve-gizlilik)
29. [Mimari ve dizin yapısı](#mimari-ve-dizin-yapısı)
30. [Test ve kalite](#test-ve-kalite)
31. [Teknik servisler ve maliyet kalemleri](#teknik-servisler-ve-maliyet-kalemleri)
32. [Devir teslim ve sahiplik](#devir-teslim-ve-sahiplik)
33. [Sorun giderme](#sorun-giderme)
34. [Bilinen sınırlamalar](#bilinen-sınırlamalar)

---

## 1. Proje nedir

| Bölüm | İçerik |
|---|---|
| **Herkese açık site** | Ana Sayfa, Hakkımızda, Ekibimiz (+ her avukat için otomatik profil sayfası), 7 çalışma alanı sayfası, Yayınlar (kategori filtresi, arama, sayfalama, makale sayfaları), İletişim (form + harita), KVKK / Çerez / Gizlilik / Kullanım Koşulları, özel 404 |
| **Yönetim paneli** (`/admin`) | Yayınlar (zengin metin editörü, taslak/yayın, zamanlama, önizleme, kategori/etiket, SEO), Çalışma Alanları (sıralama), Ekip (sınırsız üye, alan gizleme, sıralama), Sayfalar (ana sayfa/hakkımızda metinleri, hukuki metinler), İletişim mesajları, Medya, Site Ayarları, SEO, Kullanıcılar (roller), Sistem ve yedekleme (durum, dışa aktarma, denetim kaydı) |
| **Altyapı** | PostgreSQL + Prisma, güvenli oturumlar + isteğe bağlı TOTP 2FA, hız sınırlama, denetim günlüğü, dinamik sitemap/robots, JSON-LD, çerez onayı + Google Analytics (yalnızca onayla), CSP ve güvenlik başlıkları |

**Ekip sayısı sabit değildir.** Başlangıçta 3 kişilik yer tutucu vardır (Kurucu Avukat, Kıdemli Avukat, Avukat — *taslak*, sitede görünmez). Panelden istediğiniz kadar (4., 5. …) avukat eklenebilir; her biri için `/ekibimiz/ad-soyad` profil sayfası ve sitemap girdisi **kod değişikliği olmadan** oluşur. Ekip ızgarası 1–N kişide bozulmaz.

**Gerçek bilgi uydurulmaz:** avukat adları, telefon, adres, e-posta, sicil numaraları, üniversiteler, yayınlar, referanslar ve istatistikler koda yazılmamıştır; hepsi panelden girilir. Boş alanlar sitede gizlenir.

## 2. Teknolojiler

| Katman | Seçim | Not |
|---|---|---|
| Framework | **Next.js 16.3.5** (App Router, React 19.2) | Talimatta anılan 16.3.3 güvenlik yamasının üzerindedir; kilit dosyası (`package-lock.json`) depoya dahildir |
| Stil | **Tailwind CSS 4.3** | Renkler/ölçüler `app/globals.css` içindeki CSS değişkenlerinde |
| Veritabanı | **PostgreSQL** + **Prisma 7.10** (`@prisma/adapter-pg`) | Prisma'nın `latest` etiketi bir *sürüm adayı* (8.0.0-rc) gösterdiği için kararlı 7.10 hattı sabitlendi |
| Doğrulama | **Zod 4** | Aynı şema tarayıcıda ve sunucuda |
| Editör | **Tiptap 3** | Yalnızca güvenli biçimler: H2/H3, listeler, alıntı, bağlantı, tablo… |
| Görsel | **sharp** + `next/image` | Yüklemede yeniden kodlama (WebP), sunumda AVIF/WebP |
| Kimlik doğrulama | Özel, küçük modül (`lib/auth`) | Bkz. aşağıdaki not |
| Yazı tipleri | Cormorant Garamond + Manrope (`next/font`, **self-host**) | Ziyaretçi tarayıcısı Google'a istek atmaz |
| Test | **Vitest 4** + gerçek PostgreSQL | Birim + entegrasyon + `scripts/smoke.mjs` |

**Neden Auth.js değil?** Brief "Auth.js veya Supabase Auth gibi" bir yapı önerdi. Auth.js v5 hâlâ beta hattındadır ve *Credentials + veritabanı oturumu + TOTP 2FA + hesap kilidi + denetim kaydı* kombinasyonu onunla yamalı bir biçimde yapılır. Bunun yerine, kanıtlanmış ilkelerle (rastgele 256 bit token, veritabanında yalnızca SHA-256 özeti, `httpOnly`/`Secure`/`SameSite`, scrypt, RFC 6238 TOTP, hız sınırı) yazılmış ~600 satırlık denetlenebilir bir modül kullanıldı; ek bağımlılık ve sağlayıcıya bağımlılık yoktur. Ayrıntılar: [Güvenlik](#19-güvenlik).

## 3. Yerel kurulum

Gereksinimler: **Node.js ≥ 22.12** ve npm. (PostgreSQL için Docker **gerekmez**; aşağıdaki gömülü geliştirme veritabanı yeterlidir.)

```bash
npm install                      # bağımlılıklar + Prisma istemcisi (postinstall)
cp .env.example .env             # Windows PowerShell: Copy-Item .env.example .env
```

`.env` içinde en az şunları doldurun (yerel geliştirme için):

```dotenv
DATABASE_URL="postgresql://lrn:lrn@localhost:5432/lrn_hukuk"
AUTH_SECRET="<en az 32 karakter rastgele>"        # openssl rand -base64 48
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

Ardından (üç ayrı adım):

```bash
npm run db:dev                   # 1) gömülü PostgreSQL'i başlatır (ayrı bir terminalde açık kalsın)
npm run db:deploy                # 2) tabloları oluşturur (migrasyonlar)
npm run db:seed                  # 3) 7 çalışma alanı, kategoriler, ayarlar, ekip yer tutucuları, sayfalar
npm run admin:create -- --email siz@alanadi.com --name "Ad Soyad"   # ilk yönetici (parola ekrana bir kez yazılır)
npm run dev                      # http://localhost:3000   ·   yönetim: http://localhost:3000/admin
```

Tasarımı dolu içerikle görmek isterseniz **yalnızca geliştirmede**: `npm run db:seed:demo` (3 demo profil + 3 demo yayın; hepsi "Demo İçerik" olarak işaretlidir). Temizlemek için `npm run db:seed:demo:clear`.

## 4. Ortam değişkenleri

Tüm liste ve açıklamalar `.env.example` dosyasındadır. Özet:

| Değişken | Zorunlu | Açıklama |
|---|---|---|
| `DATABASE_URL` | ✔ | PostgreSQL bağlantı adresi |
| `AUTH_SECRET` | ✔ | ≥ 32 karakter rastgele anahtar (oturum/2FA şifreleme türetimi). **Üretimde bir kez belirleyip saklayın**; değişirse oturumlar düşer ve kayıtlı 2FA çözülemez |
| `NEXT_PUBLIC_SITE_URL` | ✔ | Kanonik adres (`https://alanadi.com`). Canonical/sitemap/OG/HSTS/çerez güvenliği buna bakar |
| `SMTP_HOST` `SMTP_PORT` `SMTP_USER` `SMTP_PASSWORD` | önerilir | İletişim formu bildirimleri ve parola sıfırlama e-postası |
| `CONTACT_TO_EMAIL` `CONTACT_FROM_EMAIL` | önerilir | Alıcı / gönderen adres |
| `NEXT_PUBLIC_GA_ID` | ops. | GA4 ölçüm kimliği (panelden de girilebilir) |
| `GOOGLE_SITE_VERIFICATION` | ops. | Search Console doğrulama kodu (panelden de girilebilir) |
| `NEXT_PUBLIC_MAP_EMBED_URL` | ops. | Harita "embed" adresi (panelden de girilebilir) |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` `TURNSTILE_SECRET_KEY` | ops. | Cloudflare Turnstile (bot koruması) |
| `CRON_SECRET` | ops. | `/api/cron/maintenance` rotası için |
| `ALLOWED_ORIGINS` `ENFORCE_CANONICAL_HOST` `DATABASE_POOL_MAX` `NEXT_OUTPUT` | ops. | Gelişmiş dağıtım ayarları |

Gizli değerler yalnızca `.env` (yerel) veya hosting panelinde tutulur; **kaynak kodda sabit değer yoktur** ve `.env` git'e girmez (`.gitignore`).

## 5. Veritabanı kurulumu

Üç seçenek:

1. **Yerel geliştirme (önerilen, Docker'sız):** `npm run db:dev` — `embedded-postgres` ile gerçek bir PostgreSQL 17'yi `./.pgdata` klasöründe çalıştırır (`lrn_hukuk` ve test için `lrn_hukuk_test` veritabanlarını oluşturur). Yalnızca geliştirme içindir.
2. **Docker Compose (tek sunucu):** `docker-compose.yml` uygulamayı ve PostgreSQL 17'yi birlikte çalıştırır — [Dağıtım](#11-dağıtım).
3. **Yönetilen PostgreSQL (üretimde önerilen):** Neon, Supabase, Railway, Render, Hetzner, AWS RDS vb. Bağlantı adresini `DATABASE_URL`'e yazın. Sunucusuz ortamlarda "pooled" adres kullanın; SSL gerekiyorsa adresin sonuna `?sslmode=require` ekleyin.

Şema `prisma/schema.prisma` içindedir. Ana modeller: `User`, `Session`, `TeamMember`, `PracticeArea`, `Publication`, `Category`, `Tag`, `ContactMessage`, `SiteSetting`, `Page`, `Media`/`MediaBlob`, `AuditLog`, `RateLimit`. İçerik modellerinde `status` (DRAFT/PUBLISHED), `createdAt`, `updatedAt`, `publishedAt` ve yumuşak silme için `deletedAt` vardır.

## 6. Migrasyon

```bash
npm run db:deploy        # üretim ve CI: bekleyen migrasyonları uygular (yıkıcı değildir)
npm run db:migrate       # geliştirme: şemayı değiştirdiyseniz yeni migrasyon üretir ve uygular
npm run db:generate      # Prisma istemcisini yeniden üretir (npm install sırasında zaten çalışır)
```

Üretimde şema değişikliği yaparken **önce yedek alın** (bkz. [Yedekleme](#18-yedekleme-ve-geri-yükleme)); migrasyon dosyaları `prisma/migrations/` altında sürüm kontrolündedir.

## 7. Seed (başlangıç verisi)

| Komut | Ne yapar | Nerede kullanılır |
|---|---|---|
| `npm run db:seed` | Site ayarları satırı, **7 çalışma alanı** (bilgilendirici, reklam içermeyen metinlerle), 8 kategori, **3 ekip yer tutucusu (taslak)**, düzenlenebilir sayfalar. **Tekrar çalıştırılabilir** ve panelde yaptığınız düzenlemeleri **ezmez** | Üretim dahil |
| `npm run db:seed:demo` | 3 demo profil + 3 demo yayın (`isDemo`, metinlerinde "Demo İçerik") | **Yalnızca geliştirme** |
| `npm run db:seed:demo:clear` | Yalnızca demo kayıtları siler | Geliştirme |

Seed'de gerçek kişi adı, telefon, adres, e-posta vb. **yoktur**.

## 8. Yönetici kullanıcı oluşturma

Herkese açık bir kayıt (`/register`) sayfası **yoktur**. İlk yönetici komut satırından oluşturulur:

```bash
npm run admin:create -- --email siz@alanadi.com --name "Ad Soyad"                # güçlü parola üretir, BİR KEZ gösterir
npm run admin:create -- --email siz@alanadi.com --name "Ad Soyad" --password "…"  # kendi parolanızı verirsiniz (≥ 12 karakter)
npm run admin:create -- --email siz@alanadi.com --reset                          # unutulan parolayı yeniler
npm run admin:create -- --email editor@alanadi.com --name "Ad" --role EDITOR      # editör
```

Üretilen geçici parola ilk girişte değiştirilmek zorundadır. Sonraki kullanıcılar panelde **Kullanıcılar** sayfasından (yalnızca Yönetici) eklenir. Parola hiçbir dosyaya yazılmaz.

## 9. Geliştirme

| Komut | Açıklama |
|---|---|
| `npm run dev` | Geliştirme sunucusu (Turbopack) |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript denetimi |
| `npm test` | Birim + entegrasyon testleri (test veritabanı gerekir; yoksa entegrasyon testleri atlanır) |
| `npm run test:smoke` | Çalışan bir sunucuya karşı uçtan uca duman testi (`BASE_URL=…` ile yayındaki siteye de yönlendirilebilir) |
| `npm run brand:icons` | `public/brand` logolarından favicon/uygulama ikonları/OG görselini yeniden üretir |
| `npm run maintenance` | Süresi dolan mesajlar/oturumlar/eski kayıtları temizler |
| `npm run export:offline` | Çalışan siteden **internetsiz açılan statik örnek kopya** üretir (aşağıya bakın) |

### Çevrimdışı örnek kopya (müşteriyle yayına almadan paylaşım)

Site henüz yayında değilken müşteriye göstermek için, çalışan (yerelde `npm run build && npm start`) sitenin tüm herkese açık sayfalarını tek klasörde toplayan bir dışa aktarma vardır:

```bash
npm run export:offline -- --base http://localhost:3000 --out offline-demo
```

- Çıktı `offline-demo/` klasörüdür (git'e girmez). Zip'leyip gönderin; alıcı çıkarıp `index.html`'e çift tıklar — sunucu, internet veya kurulum gerekmez.
- Betik site haritasından ve bağlantılardan tüm sayfaları gezer, JavaScript'i kaldırır, yazı tiplerini ve görselleri dosyaya gömer, bağlantıları göreli `…/index.html` yapar; sayfalara `noindex` ekler ve “çevrimdışı örnek kopya” rozeti koyar.
- Çalışmayanlar: yönetim paneli, iletişim formu gönderimi ve arama (form denendiğinde açıklayıcı bir uyarı çıkar).
- Windows'ta klasör yolu 260 karakteri aşarsa tarayıcı dosyayı açamaz; zip'i kısa bir yola (ör. Masaüstü) çıkarın.
- Bu bir **yayın değildir**; canlı site için [Dağıtım](#11-dağıtım) bölümünü izleyin. Yayına almadan önce demo içerikler `npm run db:seed:demo:clear` ile silinmelidir.

## 10. Üretim derlemesi

```bash
npm ci
npm run db:deploy
npm run build          # DİKKAT: derleme sırasında veritabanına erişir (sayfalar önbelleğe alınır)
npm start              # varsayılan port 3000; PORT değişkeniyle değiştirilir
```

Herkese açık sayfalar **ISR** ile önbelleğe alınır (en fazla 5 dakika); panelde kaydet/yayınla/sil sonrası ilgili önbellek **anında** geçersiz kılınır. Sitemap 1 saatte bir veya içerik değişince yenilenir.

## 11. Dağıtım

Platform bağımlılığı bilinçli olarak düşük tutulmuştur; yalnızca Node.js + PostgreSQL gerekir.

### Seçenek 1 — Vercel + yönetilen PostgreSQL

1. Depoyu Vercel'e bağlayın (`vercel.json` build komutunu ve günlük bakım cron'unu içerir).
2. **Environment Variables**: `DATABASE_URL` (pooled), `AUTH_SECRET`, `NEXT_PUBLIC_SITE_URL`, SMTP değişkenleri, `CRON_SECRET`.
3. İlk dağıtımdan önce, kendi bilgisayarınızdan: `DATABASE_URL=<üretim adresi> npm run db:deploy && npm run db:seed && npm run admin:create -- --email … --name …` (veya Vercel CLI ile).
4. Alan adını ekleyin ([Alan adı](#12-alan-adı-bağlama)).

> Vercel **Hobby** planı ticari olmayan kullanım içindir; bir hukuk bürosunun kurumsal sitesi için **Pro** (veya VPS) uygundur — güncel şartları kontrol edin. Vercel'de dosya sistemi kalıcı olmadığından görseller zaten veritabanında saklanır; ek depolama servisi gerekmez.

### Seçenek 2 — Node destekli VPS / bulut sunucu (en düşük işletme maliyeti)

Ubuntu 22.04/24.04 örneği:

```bash
# Node 22 + PostgreSQL 17 + nginx kurulu olduğunu varsayıyoruz
git clone <depo-adresi> /srv/lrn-hukuk && cd /srv/lrn-hukuk
cp .env.example .env && nano .env            # DATABASE_URL, AUTH_SECRET, NEXT_PUBLIC_SITE_URL, SMTP…
npm ci && npm run db:deploy && npm run db:seed
npm run admin:create -- --email siz@alanadi.com --name "Ad Soyad"
npm run build
npm i -g pm2 && pm2 start "npm start" --name lrn-hukuk && pm2 save && pm2 startup   # yeniden başlatmada otomatik açılır
```

- Ters vekil ve HTTPS için `deploy/nginx.conf.example` dosyasını kullanın (**`X-Forwarded-For` ezilir** — hız sınırı gerçek IP'ye dayanır).
- Yeni sürüm: `git pull && npm ci && npm run db:deploy && npm run build && pm2 restart lrn-hukuk`.
- Günlük bakım için cron: `0 3 * * * cd /srv/lrn-hukuk && npm run maintenance`.

### Seçenek 3 — Docker Compose (uygulama + PostgreSQL tek sunucuda)

```bash
cp .env.example .env     # POSTGRES_PASSWORD, AUTH_SECRET, NEXT_PUBLIC_SITE_URL, SMTP…
docker compose up -d --build
docker compose exec app npm run db:seed
docker compose exec app npm run admin:create -- --email siz@alanadi.com --name "Ad Soyad"
```

Uygulama `127.0.0.1:3000`'de dinler; önüne nginx/Caddy koyun. Derleme, konteyner ilk açılırken (veritabanı hazır olunca) yapılır — bkz. `Dockerfile`.

### Yayın öncesi kontrol listesi

- [ ] `NEXT_PUBLIC_SITE_URL` gerçek `https://` adresi
- [ ] `AUTH_SECRET` üretildi ve güvenli yerde saklanıyor
- [ ] Yönetici hesabı açıldı, **2FA etkinleştirildi**
- [ ] Panel → *Site Ayarları*: adres, telefon, e-posta, çalışma saatleri (yalnızca gerçek bilgiler)
- [ ] Panel → *Ekip*: yer tutucular gerçek bilgilerle dolduruldu ve **aktifleştirildi**
- [ ] Panel → *Sayfalar*: KVKK/Çerez/Gizlilik/Kullanım metinleri **hukukçu tarafından onaylandı**
- [ ] SMTP çalışıyor (*Sistem ve yedekleme → Test e-postası*), SPF/DKIM/DMARC kuruldu
- [ ] Demo içerik yok (`npm run db:seed:demo:clear`)
- [ ] Yedekleme çalışıyor **ve geri yükleme denendi**
- [ ] `BASE_URL=https://alanadi.com npm run test:smoke` geçiyor

## 12. Alan adı bağlama

Kod belirli bir alan adına bağlı değildir; her şey `NEXT_PUBLIC_SITE_URL`'den okunur.

1. **Alan adını LRN Hukuk adına** bir kayıt kuruluşundan (registrar) alın; yönetici hesabı büroya ait olsun.
2. **DNS kayıtları** (sağlayıcınızın verdiği değerlerle):
   - VPS: `A` kaydı → `alanadi.com` ve `www` için sunucunun IPv4 adresi (`AAAA` → IPv6 varsa).
   - Vercel: apex için `A 76.76.21.21`, `www` için `CNAME cname.vercel-dns.com` (Vercel panelinin gösterdiği güncel değerleri esas alın).
3. **Kanonik alan adı:** tek bir adres seçin (öneri: `https://alanadi.com`) ve `NEXT_PUBLIC_SITE_URL`'e yazın. `www` → apex yönlendirmesi ya hosting panelinden ya da nginx örneğindeki gibi yapılır; alternatif olarak `ENFORCE_CANONICAL_HOST=true` uygulamanın kendisinin 308 yönlendirmesi yapmasını sağlar.
4. Vekil arkasında alan adı farklı görünüyorsa (Server Action "Origin" hataları için) `ALLOWED_ORIGINS=alanadi.com,www.alanadi.com`.
5. `NEXT_PUBLIC_*` değişkenleri **derleme sırasında** koda gömülür: `NEXT_PUBLIC_SITE_URL`'i (veya diğer `NEXT_PUBLIC_*` değerlerini) değiştirdikten sonra uygulamayı **yeniden derleyip** başlatın (`npm run build` + yeniden başlatma; Vercel'de yeniden dağıtım). Search Console'da yeni mülkü doğrulayın.

## 13. SSL / HTTPS

Site **yalnızca HTTPS** ile yayınlanmalıdır.

- **Vercel:** sertifika otomatik verilir ve yenilenir; HTTP → HTTPS yönlendirmesi platformdadır.
- **VPS:** Let's Encrypt — `sudo certbot --nginx -d alanadi.com -d www.alanadi.com`. Certbot yenileme zamanlayıcısını kurar (`systemctl list-timers | grep certbot`; deneme: `sudo certbot renew --dry-run`).
- Uygulama `NEXT_PUBLIC_SITE_URL` `https://` ise: `Secure` + `__Host-` önekli oturum çerezi, **HSTS** (2 yıl, `includeSubDomains; preload`), `upgrade-insecure-requests` CSP yönergesi ve `proxy.ts` içinde `X-Forwarded-Proto: http` → `308 https` yönlendirmesi devreye girer.

## 14. SMTP ve kurumsal e-posta

Kod belirli bir e-posta sağlayıcısına kilitli değildir; standart **SMTP** kullanır (`nodemailer`). `.env`:

```dotenv
SMTP_HOST=smtp.gmail.com        # veya smtp.office365.com, hosting sağlayıcınızın SMTP'si…
SMTP_PORT=587                   # 465 → SSL/TLS
SMTP_USER=iletisim@alanadi.com
SMTP_PASSWORD=<uygulama parolası>
CONTACT_TO_EMAIL=info@alanadi.com     # mesajları alacak yetkili adres
CONTACT_FROM_EMAIL=iletisim@alanadi.com
```

- `info@…` / `iletisim@…` gibi adresler **Google Workspace, Microsoft 365 veya hosting e-postası** üzerinden açılabilir (gerçek adresi siz belirlersiniz; koda yazılmamıştır).
- Google Workspace / Microsoft 365'te normal parola yerine **uygulama parolası** veya SMTP yetkisi gerekir.
- **SPF, DKIM ve DMARC** kayıtlarını alan adınızın DNS'ine mutlaka ekleyin; aksi halde site bildirimleri spam klasörüne düşer veya reddedilir. E-posta sağlayıcınızın "alan adı doğrulama" ekranındaki kayıtları birebir girin; DMARC için başlangıçta `v=DMARC1; p=none; rua=mailto:…` ile izleyip sonra sıkılaştırın.
- Test: panel → **Sistem ve yedekleme → Test e-postası**. SMTP tanımlı değilse iletişim mesajları yine kaydedilir (panelde "E-posta gitmedi" etiketiyle) ve site çalışmaya devam eder.
- Form gönderimi güvenliği: e-posta başlık enjeksiyonu koruması (tek satır zorlaması), yanıt adresi doğrulaması, HTML içeriğin kaçışlanması.

## 15. Google Analytics

GA4 **yalnızca ziyaretçi çerez onayı verdikten sonra** yüklenir.

1. GA4'te bir *Web veri akışı* oluşturun, `G-XXXXXXXXXX` ölçüm kimliğini alın.
2. Kimliği `NEXT_PUBLIC_GA_ID`'e **veya** panel → *Site Ayarları → Analitik*'e yazın (ID yoksa hiçbir hata olmaz, banner da gösterilmez).
3. Ziyaretçi ilk girişte çerez tercih penceresini görür: **Zorunlu** (kapatılamaz) ve **Analitik**. "Yalnızca zorunlu" ve "Kabul et" eşit görünürlüktedir. Tercih 6 ay saklanır; alt bilgideki **Çerez Tercihleri** bağlantısıyla değiştirilebilir. Onay geri çekilirse GA devre dışı bırakılır ve çerezleri silinir.
4. Yapılandırma: IP anonimleştirme açık, Google Signals ve reklam kişiselleştirme kapalı. Panelde **sahte GA panosu yoktur**; raporlar GA'de izlenir.

## 16. Google Search Console

1. Search Console → *Mülk ekle* → *URL öneki* → `https://alanadi.com`.
2. Doğrulama yöntemi **HTML etiketi**: `<meta name="google-site-verification" content="KOD">` içindeki `KOD`'u panel → **SEO → Google Search Console** alanına (veya `GOOGLE_SITE_VERIFICATION` ortam değişkenine) yazın; site etiketi otomatik ekler. *Doğrula*'ya basın.
3. *Sitemaps* bölümüne `sitemap.xml` ekleyin (`https://alanadi.com/sitemap.xml`; taslaklar hariç yalnızca yayındaki içerik listelenir).

## 17. Harita

İletişim sayfasında **gizlilik dostu** harita bulunur: üçüncü taraf çerçeve ziyaretçi *Haritayı yükle*'ye basana kadar yüklenmez.

1. Google Haritalar'da büronun adresini bulun → **Paylaş → Haritayı yerleştir** → iframe içindeki `src="…"` adresini kopyalayın.
2. Panel → **Site Ayarları → Harita gömme adresi** alanına yapıştırın (veya `NEXT_PUBLIC_MAP_EMBED_URL`). API anahtarı **gerekmez**.
3. Yalnızca `google.com/maps/embed`, `maps.google.com …output=embed` ve `openstreetmap.org/export/embed.html` adresleri kabul edilir (CSP ile uyumlu). Adres girilmişse "Haritada aç" bağlantısı da görünür.

## 18. Yedekleme ve geri yükleme

**Ne yedeklenir?** Her şey PostgreSQL'dedir: içerik, ekip, yayınlar, mesajlar, kullanıcılar **ve yüklenen görseller** (`MediaBlob`). Ayrıca (a) kaynak kod (git deposu) ve (b) ortam değişkenleri (parola yöneticisinde) saklanmalıdır.

| Konu | Öneri |
|---|---|
| Sıklık | **Günlük** otomatik veritabanı yedeği (+ büyük değişiklik / migrasyon öncesi elle) |
| Saklama | Son 7 günlük + 4 haftalık + 6 aylık; en az bir kopya **farklı bir sağlayıcıda/konumda** |
| Nerede | Yönetilen PostgreSQL'in yerleşik yedekleri **ve** ayrı bir depolama alanı (örn. şifreli bulut klasörü) |
| Geri yükleme testi | **En az ayda bir**, yedeği boş bir veritabanına yükleyip siteyi açarak deneyin. Denenmemiş yedek, yedek değildir |

Komutlar (VPS/kendi sunucu):

```bash
# YEDEK ALMA — /etc/cron.d veya crontab:  30 2 * * *  (günlük 02:30)
pg_dump --format=custom --no-owner "$DATABASE_URL" > /srv/backups/lrn-hukuk-$(date +%F).dump
find /srv/backups -name 'lrn-hukuk-*.dump' -mtime +30 -delete            # 30 günden eskiyi sil (saklama politikası)

# GERİ YÜKLEME
createdb lrn_hukuk_restore
pg_restore --no-owner --dbname "postgresql://…/lrn_hukuk_restore" /srv/backups/lrn-hukuk-2026-01-15.dump
# doğruysa DATABASE_URL'i bu veritabanına çevirip uygulamayı yeniden başlatın
```

Yönetilen servislerde (Neon, Supabase, RDS…) günlük otomatik yedek/point-in-time recovery genellikle yerleşiktir — **kapsamını ve saklama süresini kendi planınızda doğrulayın**.

**Dışa aktarma (satıcıya bağımlılığı azaltır):** panel → *Sistem ve yedekleme* → **İçerik (JSON)** ve **Mesajlar (CSV)**. Kullanıcı parolaları ve oturumlar dışa aktarılmaz.

**Saklama politikası (KVKK):** iletişim mesajları `messageRetentionDays` (varsayılan 365 gün; Site Ayarları'ndan değişir) sonunda silinmek üzere işaretlenir. `npm run maintenance` (cron) veya Vercel cron (`/api/cron/maintenance`) süresi dolanları siler; panelde de "Süresi dolanları sil" düğmesi vardır. Bakım ayrıca süresi dolmuş oturumları/eski sayaçları ve 2 yıldan eski denetim kayıtlarını temizler. Mesajların panelde saklanması Site Ayarları'ndan kapatılabilir (yalnızca e-posta).

## 19. Güvenlik

**Kimlik doğrulama ve oturum** — 256 bit rastgele oturum token'ı; veritabanında yalnızca SHA-256 özeti; `httpOnly`, `SameSite=Lax`, https'te `Secure` + `__Host-` öneki; 8 saat hareketsizlik / en fazla 7 gün; çıkışta ve parola değişiminde oturumlar silinir; 2FA sonrası **yeni** oturum üretilir (fixation koruması). Parolalar **scrypt** (N=2¹⁶, r=8, p=2) ile özetlenir; ≥ 12 karakter zorunlu; hesap 5 hatalı denemede 15 dk kilitlenir; kullanıcı yokken de aynı maliyetli doğrulama yapılır ve tek tip hata mesajı verilir (kullanıcı tespiti yok); giriş/2FA/sıfırlama/form uçları PostgreSQL tabanlı **hız sınırlıdır**.

**Yetkilendirme** — `proxy.ts` yalnızca iyimser ön kontroldür; **her sayfa** `requireUser()`, **her server action** `guard()` ile sunucuda, veritabanı oturumuyla doğrulanır (istemci tarafı/CSS ile gizleme güvenlik sayılmaz). Roller: **ADMIN** (her şey), **EDITOR** (yayın + medya). Yeni rol eklemek `lib/permissions.ts` içinde bir satırdır.

**İki adımlı doğrulama (önerilir)** — Panel → *Hesabım* → TOTP (Google/Microsoft Authenticator, 1Password…). Sır, `AUTH_SECRET`'tan türetilen anahtarla AES-256-GCM ile şifreli saklanır; kod yeniden kullanımı (replay) engellenir; 8 tek kullanımlık kurtarma kodu verilir. **Üretimde yönetici hesapları için 2FA açılması tavsiye edilir.**

**Girdi ve içerik güvenliği** — Zod ile sunucu doğrulaması; zengin metin `sanitize-html` beyaz listesiyle **kayıtta ve gösterimde** temizlenir (XSS testleri vardır); ham HTML hiçbir yerde doğrudan render edilmez; iletişim mesajları düz metin olarak gösterilir/e-postada kaçışlanır; CSV dışa aktarımı formül enjeksiyonuna karşı korunur; slug'lar sıkı desenle doğrulanır; yönlendirme parametreleri (`next`) yalnızca `/admin` altına izin verir.

**Yükleme güvenliği** — Yalnızca oturumlu + yetkili kullanıcı; `Origin` doğrulaması; hız sınırı; 8 MB üst sınır; **içerik (magic byte) doğrulaması** (bildirilen MIME'a güvenilmez); görüntü `sharp` ile yeniden kodlanır (EXIF/GPS ve gömülü içerik atılır); güvenli dosya adı; SVG yalnızca logo/favicon için, sıkı beyaz listeyle temizlenir ve `sandbox` CSP ile servis edilir.

**İletişim formu** — Honeypot, çok hızlı gönderim tespiti, IP başına (6/saat) ve e-posta başına (3/saat) sınır, isteğe bağlı Turnstile, Zod, başlık enjeksiyonu koruması, karakter sınırları. Mesajla birlikte **IP adresi saklanmaz**.

**Başlıklar** — CSP (`unsafe-eval` yok; `object-src 'none'`, `base-uri`, `form-action`, `frame-ancestors 'none'`, dış kaynak beyaz listesi), `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `X-Frame-Options`, COOP, HSTS (https'te), `X-Powered-By` kapalı; `/admin` yanıtları `noindex` + `no-store`.

**Denetim günlüğü** — Girişler (başarılı/başarısız/kilit), parola/2FA değişiklikleri, yayın/alan/ekip/sayfa/ayar/kullanıcı/medya işlemleri kaydedilir (parola/token **asla** kaydedilmez). Panel → *Sistem ve yedekleme*.

**Yumuşak silme** — Yayın, ekip ve çalışma alanı silindiğinde önce "Silinenler"e taşınır (sitede/sitemap'te görünmez), açık onay penceresi gösterilir, geri yüklenebilir.

**Üretim sertleştirme listesi:** `AUTH_SECRET` benzersiz/rastgele · https + HSTS · vekilde `X-Forwarded-For` ezilir · veritabanı yalnızca uygulamadan erişilebilir (güvenlik duvarı) · veritabanı kullanıcısına gereksiz süper kullanıcı yetkisi verilmez · yönetici hesaplarında 2FA · düzenli yedek + geri yükleme testi · `npm audit` ve Next.js/Prisma güvenlik yamalarının takibi.

> **CSP notu (dürüst sınır):** Herkese açık sayfalar statik olarak önbelleğe alındığı için istek başına *nonce* kullanılamaz; bu yüzden `script-src`'de Next.js'in satır içi önyükleme betikleri için `'unsafe-inline'` bulunur. Buna karşılık `unsafe-eval` yoktur, tüm içerik sanitize edilir ve diğer yönergeler kısıtlıdır.

## 20. İçerik yönetimi

Geliştirici gerekmeden yönetilebilenler: ekip, çalışma alanları, yayınlar (kategori/etiket/yazar/SEO/görsel), iletişim bilgileri, alt bilgi metni, çalışma saatleri, sosyal bağlantılar, ana sayfa kısa metinleri (başlık, alt metin, bölüm başlıkları), Hakkımızda metni ve ilkeler, KVKK/çerez/gizlilik/kullanım metinleri, SEO meta verileri, logo, favicon, OG görseli, yayın bilgilendirme notu, iletişim formu uyarı/onay metinleri, Google Analytics kimliği, Search Console kodu, harita. Ayrıntılı adımlar: [Yönetim Paneli Kullanımı](#26-yönetim-paneli-kullanımı).

## 21. Logo değiştirme

Şu an sitede, LRN Hukuk'un sağladığı logonun **vektörleştirilmiş** hâli kullanılır (`design/logo-original.webp` kaynak görseldir). Nihai/profesyonel logo hazır olduğunda:

1. Şu dosyaları aynı adlarla değiştirin (SVG önerilir): `public/brand/logo.svg` (dikey/yığılı), `logo-horizontal.svg` (üst menü, yatay), `logo-mark.svg` (monogram) ve koyu zeminler için `*-light.svg` (tek renk açık) varyantları. Boyut oranları `components/ui/media.tsx` içindeki `DEFAULTS` tablosunda tanımlıdır (`ratio` = genişlik/yükseklik); farklıysa oradan güncelleyin.
2. `npm run brand:icons` çalıştırın → `favicon.ico`, `icon.svg`, `apple-touch-icon.png`, `icon-192/512.png` ve varsayılan **OG görseli** (`og-default.png`) yeniden üretilir.
3. Kod hiç değiştirmeden denemek için panel → **Site Ayarları → Logo / Favicon** alanından PNG/WebP/SVG yükleyebilirsiniz (yüklenen logo, `public/brand` dosyasının yerine geçer; koyu zeminlerde otomatik açık renge çevrilir).

Logo briefi: minimal, zamansız, LRN monogramı; **terazi, tokmak, Themis, sütun kullanılmaz**; tek renkte, küçük boyutta ve baskıda okunabilir olmalı.

## 22. Renkleri ve tipografiyi değiştirme

Tüm renkler `app/globals.css` başındaki belirteçlerdedir (bileşenlerde sabit renk yazılmaz):

```css
:root {
  --background: #f5f1ea;   /* ivory */         --foreground: #252524;  /* charcoal */
  --surface:    #faf8f4;                        --ink:        #181918;
  --forest:     #1e3b26;   /* logo yeşili — ana vurgu */   --forest-dark: #142a1b;
  --wine:       #6b2637;   /* yalnızca küçük editoryal vurgu */  --wine-dark: #4c1927;
  --muted:      #a49d92;   --muted-foreground: #625d54;  --border: rgba(37,37,36,.12);
  --radius: 4px;
}
```

Yazı tipleri `app/layout.tsx` içinde `next/font` ile tanımlıdır (başlık: Cormorant Garamond, gövde: Manrope; her ikisi Türkçe karakterleri destekler). Marka yeşili logodan (`#1E3B26`) örneklenmiştir.

## 23. Ekip ekleme

Panel → **Ekip → Yeni ekip üyesi** → Ad soyad, unvan, kısa biyografi, fotoğraf (4:5 portre), eğitim, baro/sicil, yabancı diller, yayınlar, çalışma alanları → **Kaydet ve sitede göster**. Sistem, `/ekibimiz/ad-soyad` sayfasını ve sitemap girdisini **otomatik** oluşturur; ana sayfa ve Ekibimiz ızgarası yeni kişiyle uyum sağlar. Bir bölümü sitede göstermek istemiyorsanız *Profilde gösterilecek bölümler* kutusundan kaldırın (boş alanlar zaten gösterilmez). Sıralamayı listedeki oklarla değiştirin; *Pasife al* kişiyi siteden kaldırır, *Sil* çöp kutusuna taşır (geri alınabilir).

## 24. Makale ekleme

Panel → **Yayınlar → Yeni yayın** → başlık, (adres otomatik), kısa açıklama, metin (editör), kategori/etiket/yazar, gerekirse kapak görseli ve SEO alanları → **Taslak olarak kaydet** ya da **Yayınla**. Detaylı adımlar aşağıda.

## 25. Çalışma alanı ekleme

Panel → **Çalışma Alanları → Yeni alan**. Yeni alan otomatik olarak `/calisma-alanlari/alan-adi` adresini, ana sayfa listesini ve sitemap'i günceller. Var olan 7 alanın metinleri düzenlenebilir; sıralama oklarla değişir.

---

## 26. Yönetim Paneli Kullanımı

*(Bu bölüm teknik olmayan LRN Hukuk ekibi içindir.)*

**Giriş:** tarayıcıda `https://alanadi.com/admin` → e-posta + parola (2FA açıksa telefondaki 6 haneli kod). Parolanızı unuttuysanız giriş ekranındaki **Parolamı unuttum** bağlantısını kullanın. İlk girişte geçici parolanızı değiştirmeniz istenir. **Hesabım** sayfasından iki adımlı doğrulamayı açmanızı öneririz.

### Yeni makale ekleme

1. **Admin'e giriş yapın.**
2. Soldaki menüden **Yayınlar**'a tıklayın.
3. **Yeni yayın** düğmesine basın.
4. **Başlık** ve **Metin** alanlarını doldurun. Alt başlık için editördeki **H2/H3** düğmelerini, liste/alıntı/tablo/bağlantı için diğer düğmeleri kullanın. Başka bir yerden kopyaladığınız metin otomatik olarak temizlenir.
5. **Kısa açıklama**yı yazın (kartlarda ve arama sonuçlarında görünür). Kategori, etiket ve yazar seçin.
6. **SEO alanlarını** doldurun (boşsa başlık/özet kullanılır): en fazla 70 karakterlik başlık, 170 karakterlik açıklama. "En iyi", "garantili", "başarı oranı" gibi ifadeler **kullanmayın**.
7. **Önizle** düğmesiyle yazının sitedeki görünümünü kontrol edin (yalnızca siz görürsünüz).
8. **Yayınla**'ya basın. Yazı hemen sitede görünür. Hazır değilse **Taslak olarak kaydet**'i kullanın — taslaklar sitede ve arama motorlarında görünmez.

Diğer işlemler: **Güncelle** (yayındaki yazıyı değiştirir, sitede anında yansır) · **Taslağa al** (siteden kaldırır) · yayın **tarihini** değiştirme (ileri tarih girerseniz yazı o tarihte görünür; en fazla 5 dk gecikmeyle) · **Öne çıkar** (ana sayfada başa alır) · **Sil** (onay ister; "Silinenler" sekmesinden geri yüklenir).

### Ekip üyesi ekleme / düzenleme

1. **Ekip** → **Yeni ekip üyesi** (veya listeden mevcut kişiyi seçin — başlangıçta 3 yer tutucu vardır).
2. Ad soyad, unvan, kısa biyografi, fotoğraf, eğitim, baro/sicil bilgileri, yabancı diller, çalışma alanları ve yayınları girin. Bilmediğiniz/yayınlamak istemediğiniz alanları boş bırakın.
3. Sağ taraftan hangi bölümlerin profilde görüneceğini seçin.
4. **Kaydet ve sitede göster** ile aktifleştirin (**Önizle** ile önce kontrol edebilirsiniz). Profil sayfası otomatik oluşur.
5. Sıralama: **Ekip** listesinde yukarı/aşağı okları. Bir kişiyi geçici olarak kaldırmak için **Pasife al**.

### Çalışma alanı ekleme / düzenleme

1. **Çalışma Alanları** → **Yeni alan** (veya mevcut alana tıklayın).
2. Başlık, kısa açıklama, başlıca konu başlıkları (her satıra bir tane), ayrıntılı içerik, ilgili avukatlar ve ilgili yayınları seçin.
3. **Yayınla** ile yayımlayın. Sıralamayı listedeki oklarla değiştirin.

### Diğer bölümler

- **Sayfalar:** Ana sayfadaki başlık/metinleri, Hakkımızda'yı ve KVKK/Çerez/Gizlilik/Kullanım metinlerini düzenleyin. Hukuki metinleri hukukçunuz kontrol edince *"hukukçu tarafından kontrol edildi"* kutusunu işaretleyin.
- **İletişim Mesajları:** Formdan gelenleri okuyun, yanıtlayın, silin. Yeni mesaj sayısı menüde görünür.
- **Medya:** Yüklenen görseller ve alternatif metinleri.
- **Site Ayarları:** adres, telefon, e-posta, çalışma saatleri, harita, sosyal bağlantılar, logo, alt bilgi ve form metinleri (yalnızca Yönetici).
- **SEO:** varsayılan başlık/açıklama, paylaşım görseli, Search Console kodu ve sayfa bazında SEO durumu.
- **Kullanıcılar:** yeni kullanıcı ekleme (Yönetici veya Editör), pasife alma, parola/2FA sıfırlama. *Editör* yalnızca yayınları ve medyayı yönetebilir.
- **Sistem ve yedekleme:** durum kontrolleri, test e-postası, veri dışa aktarma, işlem kayıtları.

**Sık sorulanlar** — *Değişiklik sitede görünmüyor?* Kaydet/Yayınla sonrası anında yansır; tarayıcıyı yenileyin. *Yanlışlıkla sildim?* İlgili listede **Silinenler** sekmesinden **Geri yükle**. *Telefonumu kaybettim (2FA)?* Başka bir yönetici **Kullanıcılar → 2FA'yı sıfırla** ile sıfırlar veya kurtarma kodlarınızdan birini kullanın.

---

## Meslek kurallarına uygunluk notları

Site, Avukatlık Kanunu ve TBB Avukatlık Meslek Kuralları'nın reklam yasağı çerçevesinde **bilgilendirici** olacak biçimde tasarlandı. **Bilinçli olarak yoktur:** "en iyi/en başarılı/lider/1 numara", başarı yüzdesi veya dava sonucu, müvekkil yorumu/referans/müvekkil logosu, ödül/sıralama iddiası, sonuç garantisi, rakip karşılaştırması, "uzman avukat" gibi yanıltıcı uzmanlık iddiası, agresif/satış odaklı çağrılar ("hemen arayın", "ücretsiz danışmanlık"), anahtar kelime doldurma, sahte deneyim yılı/metrik, `rating/review/award` şema verisi. Kuralları sonradan eklenen içerikler için de koruyun (`AGENTS.md`).

> Bu, hukuki bir uygunluk **güvencesi değildir**: yürürlükteki mevzuat ve TBB düzenlemelerine uygunluk, yayına almadan önce LRN Hukuk tarafından (ve gerekirse bağlı olunan baro ile) ayrıca kontrol edilmelidir. Bu yüzden tüm içerik panelden düzenlenebilir bırakılmıştır.

## KVKK, çerez ve gizlilik

- İletişim formu **veri minimizasyonu** ile tasarlandı: ad soyad, e-posta, konu, mesaj zorunlu; telefon isteğe bağlı; özel nitelikli veri paylaşılmaması uyarısı (metni panelden düzenlenir) ve KVKK aydınlatma metnine bağlantılı onay kutusu.
- Mesajlar için **saklama süresi** altyapısı vardır (bkz. [Yedekleme](#18-yedekleme-ve-geri-yükleme) → saklama politikası). IP adresi mesajla saklanmaz.
- **Çerez:** yalnızca zorunlu çerez kullanılıyorsa (GA tanımlı değilse) banner gösterilmez. GA tanımlıysa onay olmadan yüklenmez.
- **Yer tutucu metinler:** `/kvkk`, `/cerez-politikasi`, `/gizlilik`, `/kullanim-kosullari` **hukukçu kontrolünden geçmelidir**; köşeli parantezli `[…]` alanları doldurulmalıdır. Panelde onaylanana kadar "Yayına hazırlık" listesinde bekleyen madde olarak görünür.
- Harita gibi üçüncü taraf gömmeler kullanıcı etkileşimiyle yüklenir.

## Mimari ve dizin yapısı

```
app/
  (public)/            herkese açık site (ISR)      → page.tsx, hakkimizda, ekibimiz/[slug], calisma-alanlari/[slug],
                                                       yayinlar/(list)|[slug], iletisim, kvkk, cerez-politikasi, gizlilik, kullanim-kosullari
  admin/(auth)/        giriş, 2FA, parola sıfırlama
  admin/(panel)/       yönetim: yayinlar, calisma-alanlari, ekip, sayfalar, mesajlar, medya, ayarlar, seo, kullanicilar, sistem, hesabim
  admin/api/           media (yükleme/liste), export (JSON/CSV)
  api/                 health, cron/maintenance
  media/[id]/          yüklenen görselleri sunar (değişmez, önbellekli)
  sitemap.ts robots.ts not-found.tsx error.tsx global-error.tsx layout.tsx globals.css
components/            layout/ home/ team/ practice/ publications/ forms/ admin/ ui/
lib/
  auth/                oturum, parola (scrypt), TOTP, giriş, sıfırlama, şifreleme
  data/                herkese açık okuma katmanı (where.ts = TEK görünürlük kuralı)
  admin/               yardımcılar, sorgular, yayına hazırlık listesi
  validation/          Zod şemaları (iletişim, yönetim)
  media/               yükleme işleme (sharp), depolama soyutlaması
  content/defaults.ts  varsayılan metinler ve hukuki yer tutucular
  seo.ts jsonld.ts email.ts contact.ts rate-limit.ts permissions.ts audit.ts richtext.ts …
prisma/                schema.prisma, migrations/, seed.ts, seed-demo.ts, seed-data/
public/brand/          logo SVG'leri, favicon, OG görseli
scripts/               dev-db, create-admin, maintenance, smoke, build-brand-assets
tests/                 unit/ + integration/ (gerçek PostgreSQL)
deploy/                nginx örneği, docker-entrypoint
proxy.ts               Next.js 16 proxy (iyimser /admin ön kontrolü, https/kanonik yönlendirme)
```

**Önbellek stratejisi:** herkese açık sayfalar `revalidate = 300` (ISR); her yönetim eylemi sonunda `revalidatePath('/', 'layout')` ile önbellek anında geçersiz kılınır. Taslak/silinmiş/zamanlanmış içerik herkese açık sorgularda, sitemap'te ve API'de **tek bir filtre** (`lib/data/where.ts`) ile dışarıda tutulur.

## Test ve kalite

```bash
npm run lint && npm run typecheck && npm test && npm run build
npm start &   # ve
npm run test:smoke
```

- **Birim testleri (65):** slug, metin/arama normalizasyonu, parola/scrypt, TOTP (RFC 6238 vektörleri), AES-GCM, XSS/sanitize saldırı yükleri, SVG temizliği, harita adresi/dosya türü doğrulama, rol izinleri, metadata/canonical/OG, JSON-LD'de rating/review olmaması, `proxy.ts` yönlendirmeleri, form şemaları.
- **Entegrasyon testleri (26, gerçek PostgreSQL):** taslak/silinmiş/zamanlanmış içeriğin sayfa/arama/sitemap'te görünmemesi, 4. avukat ekleme, giriş (kilit, hız sınırı, 2FA, kurtarma kodu, replay), parola sıfırlama, iletişim formu (honeypot, hız sınırı, saklama süresi, başlık enjeksiyonu), bakım görevi.
- **Duman testi (55 denetim):** tüm herkese açık rotalar (tek H1, `lang`, canonical, OG, JSON-LD), 404, panel koruması, güvenlik başlıkları, sitemap'teki her adresin 200 dönmesi, robots, sağlık ucu.
- **Erişilebilirlik:** semantik HTML, atla bağlantısı, görünür odak, klavye ile kullanılabilir menü/diyaloglar (yerel `<dialog>`), `prefers-reduced-motion`, etiketli form alanları ve `aria-invalid`/hata bağlantıları.
- **Yatay taşma:** herkese açık sayfalar 360, 375, 768 ve 1440 px genişliklerinde tarayıcıda ölçülüp yatay taşma olmadığı doğrulandı (ölçümde 360 px'te bir ızgara boşluğu taşması bulunup düzeltildi).
- **Lighthouse** (mobil, kısıtlı ağ/CPU simülasyonu, yerel üretim derlemesi): Ana Sayfa, Hakkımızda, Çalışma Alanı, İletişim ve Makale sayfalarında **Erişilebilirlik 100 · En İyi Uygulamalar 100 · SEO 100 · Performans 92–96** (CLS ≈ 0, TBT 30–60 ms, LCP ≈ 2,8–3,3 sn simülasyonlu mobil). Bu değerler geliştirici bilgisayarında ölçülmüştür; yayındaki sitede (CDN, gerçek ağ) yeniden ölçün. Ölçümlerde iletişim sayfasının tembel yüklenen doğrulama şeması ve yazı tipi ön yükleme sayısının azaltılması ile iyileştirme yapıldı.

## Teknik servisler ve maliyet kalemleri

Brief'te müşteri, teklifte ayrı ayrı belirtilmesini istedi. **Fiyatlar sağlayıcıya ve tarihe göre değiştiği için buraya sabit tutar yazılmadı**; aşağıdaki tabloyu güncel tekliflerle doldurun.

**Teklif kalemleri**

| Kalem | Tutar / Not |
|---|---|
| Web tasarım ve geliştirme bedeli (bu proje) | _teklif_ |
| Logo bedeli (ayrı çalışma; geçici vektör logo bu projede) | _teklif_ |
| Yıllık alan adı gideri | _kayıt kuruluşuna göre_ |
| Yıllık hosting gideri | _seçilen seçeneğe göre (aşağı)_ |
| Bakım ve destek ücreti | _teklif_ |
| Tahmini teslim süresi | _teklif_ |
| Kullanılan altyapı | Next.js + PostgreSQL + Prisma (aşağıdaki liste) |
| Yayın sonrası destek süresi | _teklif_ |

**Üçüncü taraf servisler (yıllık maliyet ayrıştırması)**

| Servis | Rolü | Zorunlu mu / maliyet notu |
|---|---|---|
| Alan adı (registrar) | `alanadi.com` | Zorunlu — yıllık ücret; **büro adına** alınmalı |
| Hosting | Node.js çalıştırma | Zorunlu — **VPS** (en düşük işletme maliyeti) *veya* Vercel Pro |
| PostgreSQL | Tüm veri (görseller dahil) | Zorunlu — VPS üzerinde kendi kurulumunuz ücretsiz; yönetilen servislerin ücretsiz/ücretli katmanları vardır |
| Kurumsal e-posta / SMTP | info@… adresleri, form bildirimi | Google Workspace / Microsoft 365 / hosting e-postası — kullanıcı başına aylık ücret |
| SSL sertifikası | HTTPS | **Ücretsiz** (Let's Encrypt / platform) |
| Google Analytics + Search Console | Ölçüm / arama görünürlüğü | Ücretsiz |
| Harita gömme | Konum | Ücretsiz (API anahtarsız embed) |
| Cloudflare Turnstile | Bot koruması (ops.) | Ücretsiz |
| Yedek depolama | Şifreli yedek kopyası | Küçük (site verisi MB düzeyinde) |
| Uptime izleme (ops.) | `/api/health` | Ücretsiz katmanlar yeterli |

Bütçe bilinciyle: ücretli SaaS/enterprise servis, ücretli kütüphane veya harici depolama/arama/CMS servisi **kullanılmamıştır**; medya PostgreSQL'de tutulur (ek depolama faturası yok), hız sınırı Redis gerektirmez.

## Devir teslim ve sahiplik

Proje herhangi bir ajans hesabına bağımlı değildir. Teslimde **LRN Hukuk'un sahip olması/yönetici olarak erişmesi gerekenler:**

- [ ] **Alan adı** ve kayıt kuruluşu hesabı (yönetici e-postası büronun)
- [ ] **DNS** yönetimi
- [ ] **Hosting** hesabı (Vercel/VPS/bulut) ve fatura sahipliği
- [ ] **Kaynak kod deposu** (GitHub/GitLab; büro organizasyonu altında)
- [ ] **Veritabanı** erişimi ve yedek konumu
- [ ] **Yönetim paneli** yönetici hesabı (ve 2FA kurtarma kodları)
- [ ] **Google Analytics** ve **Search Console** mülkleri (büronun Google hesabında; ajans yalnızca yetkili kullanıcı)
- [ ] **SMTP / kurumsal e-posta** yönetimi (SPF/DKIM/DMARC dahil)
- [ ] **Ortam değişkenleri / yapılandırma** dokümantasyonu (`.env.example` + bu README; gerçek değerler büronun parola yöneticisinde)
- [ ] Logo kaynak dosyaları

**Vendor lock-in azaltma:** standart PostgreSQL + Node.js; tek `pg_dump` ile tüm veri taşınır; panelden JSON/CSV dışa aktarma; platforma özgü SDK yok (Vercel dosyaları isteğe bağlıdır); SMTP standardı.

## Sorun giderme

| Belirti | Çözüm |
|---|---|
| `AUTH_SECRET tanımlı değil veya çok kısa` | `.env`'de ≥ 32 karakterlik değer verin (`openssl rand -base64 48`) |
| `next build` veritabanı hatası | Derleme veritabanına erişir; `DATABASE_URL` erişilebilir ve migrasyonlar uygulanmış olmalı (`npm run db:deploy`) |
| Panelde form gönderilince "Invalid Server Actions request" | Vekil arkasında alan adı farklı: `ALLOWED_ORIGINS`'i ayarlayın; vekilin `Host`/`X-Forwarded-Host` başlıklarını ilettiğinden emin olun |
| Giriş yapılamıyor, "hatalı" mesajı | 5 hatalı denemede hesap 15 dk kilitlenir; bekleyin ya da başka yönetici `Kullanıcılar → Parolayı sıfırla` yapsın. Tek yöneticiyseniz: `npm run admin:create -- --email … --reset` |
| 2FA telefonu kayboldu | Kurtarma kodu kullanın; yoksa başka bir yönetici `2FA'yı sıfırla`; tek yöneticiyseniz veritabanında `User` satırının `totpEnabled`/`totpSecret` alanları sıfırlanır |
| İletişim mesajı geliyor ama e-posta gelmiyor | Sistem → *Test e-postası*; SMTP bilgileri/port/SSL; SPF-DKIM-DMARC; sunucu günlükleri |
| Yüklenen görsel reddediliyor | JPEG/PNG/WebP/AVIF, ≤ 8 MB olmalı; içerik dosya türüyle uyuşmalı |
| Sitede içerik güncellenmiyor | Panelde kaydettikten sonra anında yenilenir; hâlâ eskiyse tarayıcı/CDN önbelleğini temizleyin, sunucunun veritabanına eriştiğini `/api/health` ile doğrulayın |
| `prisma generate` hatası (kurulumda) | Node ≥ 22.12 kullanın; `npm install` yeniden çalıştırın |
| Windows'ta `db:dev` locale hatası | Betik `--locale=C` kullanır; `.pgdata` klasörünü silip yeniden deneyin |

## Bilinen sınırlamalar

- **Medya depolama:** görseller PostgreSQL'dedir (basitlik + tek yedek + maliyet). Binlerce görsel/çok büyük medya için `lib/media/storage.ts` arkasına S3 uyumlu sürücü eklenmelidir (arayüz hazırdır; **S3 sürücüsü uygulanmamıştır**).
- **CSP:** Herkese açık sayfalarda `script-src 'unsafe-inline'` vardır (ISR ile nonce uyumsuz — bkz. [Güvenlik](#19-güvenlik)). Yönetim paneli de aynı politikayı kullanır.
- **Hukuki metinler yer tutucudur** ve mevzuat/TBB uygunluğu büro tarafından doğrulanmalıdır.
- **Doğrulama kapsamı:** arayüz Chromium tabanlı bir tarayıcıda (masaüstü ve 360–430 px mobil) elle denenmiştir; Safari/Firefox'ta ayrıca kontrol edilmemiştir. SMTP gerçek bir sağlayıcıya karşı denenmemiştir (yapılandırma yoksa yedek davranış test edilmiştir). Yük testi yapılmamıştır.
- Zamanlanmış yayın, sayfa önbelleğinin yenilenmesine (en fazla 5 dk) bağlıdır.
- Yalnızca Türkçe (tek dil) desteklenir.
