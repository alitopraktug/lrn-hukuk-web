# Devir notu — bu proje burada kaldı

Bu dosya, projeyi Claude Code ile devralacak kişi için yazıldı. Ayrıntılı teknik dokümantasyon
[`README.md`](README.md) içinde (35+ bölüm); proje kuralları [`AGENTS.md`](AGENTS.md) içinde
(Claude Code bunu otomatik okur, tekrar anlatmaya gerek yok). Bu notun amacı **nerede kalındığını**
ve **sırada ne olduğunu** hızlıca özetlemek.

## Proje nedir

Ankara merkezli LRN Hukuk için kurumsal web sitesi + yönetim paneli. Next.js 16 + TypeScript +
PostgreSQL/Prisma 7 + Tailwind 4. Kaynak: orijinal brief'in tamamı `AGENTS.md`'nin başındaki
projeye özgü kurallarda özetlendi; reklam dili yasağı, gerçek kişi/telefon/adres uydurmama gibi
**değişmez kurallara** özellikle dikkat edin — bunlar müşterinin (avukatlık meslek kuralları
nedeniyle) ısrarla istediği kısıtlamalar.

## Şu ana kadar ne yapıldı (git geçmişi)

`git log --oneline` ile 6 commit görürsünüz — her biri gerçek bir aşama, hiçbiri kaybolmadı:

1. **Sürüm 1** — İlk tam site + panel: 7 çalışma alanı, sınırsız ekip profili, yayınlar, iletişim
   formu, KVKK/çerez, güvenli admin (2FA, rol, denetim günlüğü), tüm testler. Sade/editoryal tasarım.
2. **Sürüm 2 (/vitrin)** ve **Sürüm 2 devamı** — Müşterinin gösterdiği bir referans siteye
   (fundainal.av.tr) yapısal olarak yaklaştırma denemeleri. **Artık kullanılmıyor**, sonraki commit'te
   `/vitrin` silindi — sadece geçmiş olarak duruyor.
3. **Premium yeniden tasarım** (`ce61a2e`) — Müşterinin çok ayrıntılı bir "premium redesign" brief'i
   üzerine **gerçek ana tasarım** buraya oturdu: ivory/charcoal/bordo renk kimliği, mimari kapak +
   ara bölüm (stok fotoğraf yerine soyut yer tutucu), çalışma alanları için editoryal satır listesi
   (kart ızgarası değil), koyu "Yaklaşımımız" bölümü, kısıtlı hareket (her bölüm kaydırmada uçmuyor),
   "AI şablon" hissi veren her şeyin (gradient/glassmorphism/badge/pill/aşırı yuvarlak köşe) temizlenmesi.
4. **İngilizce sürüm** (`4995efd`, en son commit) — `/en` altında **tam** İngilizce site: menü, footer,
   form, çerez bildirimi, 7 çalışma alanının tam çevirisi, dil değiştirici, hreflang, site haritası.
   Yayınlar (blog) kasıtlı olarak yalnızca Türkçe (bkz. README → "Çok dilli site").

**Şu an ekrandaki/canlı hâl = en son commit.** Farklı bir yöne gitmek isterseniz `git log` ve
`git diff <commit>` ile önceki sürümlere bakabilir, gerekirse `git checkout` ile geri dönebilirsiniz.

## Hemen yapmanız gerekenler (yeni ortamda)

```bash
npm install
cp .env.example .env          # .env bilerek zip'e dahil edilmedi — gizli anahtar taşınmaz
```

`.env` içine en azından şunları doldurun (README → "4. Ortam değişkenleri"):
`DATABASE_URL`, `AUTH_SECRET` (yeni/rastgele üretin — eskisini biliyor olsanız bile paylaşılmış bir
zip'ten gelen değeri ASLA prod'da kullanmayın), `NEXT_PUBLIC_SITE_URL`.

```bash
npm run db:dev        # ayrı terminalde açık kalsın (gömülü PostgreSQL)
npm run db:deploy     # migrasyonlar
npm run db:seed       # 7 çalışma alanı + kategoriler + 3 ekip yer tutucusu + sayfalar
npm run admin:create -- --email siz@alanadi.com --name "Ad Soyad"
npm run dev
```

İsteğe bağlı, tasarımı dolu içerikle görmek için: `npm run db:seed:demo` (3 demo profil + 3 demo
yayın; "Demo İçerik" etiketiyle işaretli, gerçek içerik girilmeden önce `npm run db:seed:demo:clear`
ile temizlenmeli).

**Not:** Bu oturumda kullanılan yerel admin hesabı (`yonetici@ornek.test`) ve embedded PostgreSQL
verisi zip'e dahil DEĞİL (`.pgdata`, `node_modules`, `.next` hariç tutuldu — hepsi yeniden
üretilebilir). Sıfırdan kurulum gerekiyor, yukarıdaki adımlar yeterli.

## Doğrulama (her değişiklikten sonra çalıştırın)

```bash
npm run lint && npm run typecheck && npm test && npm run build
npm start &   npm run test:smoke
```

Son durumda: lint/typecheck temiz, **91 birim+entegrasyon testi** ve **55 duman testi** yeşil
(İngilizce sayfalar dahil — site haritasındaki her adres otomatik 200 kontrolünden geçiyor).

## Sırada ne var / bilinen eksikler

`README.md` → **"Bilinen sınırlamalar"** bölümünde tam liste var. Öne çıkanlar:

- **Gerçek fotoğraf yok.** Kapak ve "mimari ara" bölümü bilinçli soyut yer tutucu (stok görsel
  değil). Müşteri ofis/mimari fotoğraf sağladığında `components/home/hero.tsx` (`ArchitecturalPanel`)
  ve `app/(public)/page.tsx` (`ArchitecturalBreak`) içindeki deseni `next/image` ile değiştirin.
- **Hukuki metinler (KVKK/Çerez/Gizlilik/Kullanım Koşulları) yer tutucu** — köşeli parantezli `[…]`
  alanlar var, hukukçu onayı gerekiyor. İngilizce çevirisi de yok (bilinçli — bkz. README).
  Bunlar tamamlanmadan **yayına alınmamalı**.
  * `npm run admin:create -- --email ... --reset` ile giriş yapıp "Yayına hazırlık" listesini
  (panel ana sayfası) takip edin — eksik olan her şeyi tek yerde gösterir.
- **Gerçek isim/telefon/adres/sicil no yok** — 3 ekip profili hâlâ "Demo Profil Bir/İki/Üç" yer
  tutucusu. Gerçek bilgiler yalnızca panelden, **uydurmadan** girilmeli (AGENTS.md kuralı).
- **Yayınlar (blog) yalnızca Türkçe** — İngilizce çok dilli genişletme isteniyorsa `lib/i18n/`
  altındaki mimari zaten buna hazır (bkz. README → "Çok dilli site" bölümündeki mimari özeti),
  ama gerçek makale çevirisi otomatik üretilmedi (kalite/güvenilirlik nedeniyle bilinçli tercih).
- **Alan adı, hosting, SMTP, Google Analytics/Search Console** henüz bağlanmadı — hepsi README →
  ilgili bölümlerde adım adım anlatılıyor.
- SMTP gerçek bir sağlayıcıya karşı denenmedi; Safari/Firefox ayrıca test edilmedi; yük testi yok.

## Teslim edilen ek dosyalar (bu klasörün dışında, müşteriye ayrıca gönderildi)

Bu oturumda müşteriye offline/sunum amaçlı birkaç dosya da üretildi (proje klasörünün dışında,
zip'e dahil değil): bir tanıtım PDF'i, çevrimdışı statik site kopyası ve tüm sayfaların tek tek
göründüğü bir katalog PDF'i. Bunlar **artık güncel değil** (o zamanki sade tasarımı gösteriyorlardı,
bu proje o zamandan beri kökten değişti — premium yeniden tasarım + İngilizce sürüm eklendi).
Güncellenmiş bir sunum/offline paket gerekiyorsa `scripts/export-offline.mjs` betiği ve README →
ilgili notlar başlangıç noktası olabilir; sıfırdan yeniden üretilmesi gerekir.

## Claude Code ile devam etmek için

Bu klasörde `claude` çalıştırmanız yeterli — `CLAUDE.md` (→ `AGENTS.md`'ye yönlendirir) otomatik
okunur, proje kuralları ve mimari bilgisi bağlama otomatik yüklenir. Yeni bir isteğe başlamadan önce
Claude'a bu dosyayı ("DEVIR-NOTU.md") okumasını söylemeniz yeterli, gerisini oradan alır.
