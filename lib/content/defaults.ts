/**
 * Site içeriği için varsayılanlar. Yönetim panelinde bir alan boş bırakılırsa/kayıt yoksa bu metinler kullanılır.
 * Tüm metinler bilgilendirme amaçlıdır; "en iyi", "başarı oranı", "garanti" vb. tanıtım/iddia ifadeleri bilinçli olarak yoktur.
 *
 * ÖNEMLİ: Hukuki metinler (KVKK, çerez, gizlilik, kullanım koşulları) YER TUTUCUDUR. Yayına almadan önce
 * LRN Hukuk'un kendi hukukçusu tarafından gözden geçirilip tamamlanmalıdır (bkz. README → "Yayın öncesi kontrol listesi").
 */

export const DEFAULT_SETTINGS = {
  firmName: "LRN Hukuk",
  defaultTitle: "LRN Hukuk | Ankara",
  defaultDescription:
    "LRN Hukuk, Ankara merkezli bir hukuk bürosudur. İş ve sosyal güvenlik, ceza, sağlık, şirketler, ticaret, aile ve idare hukuku alanlarında bireysel ve kurumsal hukuki süreçlerde çalışır.",
  footerText:
    "LRN Hukuk, Ankara merkezli bir hukuk bürosudur. Bu internet sitesindeki bilgiler genel bilgilendirme amacı taşır; hukuki görüş veya danışmanlık niteliğinde değildir.",
  publicationDisclaimer:
    "Bu yayında yer alan açıklamalar genel bilgilendirme amacı taşımaktadır ve somut bir hukuki mesele bakımından hukuki görüş veya danışmanlık niteliğinde değildir.",
  contactNotice:
    "Lütfen mesajınızda özel nitelikli kişisel veri (sağlık, din, ceza mahkûmiyeti vb.) paylaşmayınız. Bu form ilk iletişim ve genel bilgi talepleri içindir; mesajınızın gönderilmesi avukat–müvekkil ilişkisi kurulduğu anlamına gelmez.",
  contactConsentLabel:
    "{{KVKK Aydınlatma Metni}}'ni okudum; mesajımın yanıtlanması amacıyla kişisel verilerimin işlenmesini anladım.",
  workingHours: "",
} as const;

export type FieldDef = {
  name: string;
  label: string;
  type: "text" | "textarea";
  max: number;
  rows?: number;
  hint?: string;
};

/* ───────────────────────── Ana sayfa ───────────────────────── */

export const HOME_FIELDS: FieldDef[] = [
  { name: "heroEyebrow", label: "Kapak – üst etiket", type: "text", max: 60 },
  {
    name: "heroTitle",
    label: "Kapak – ana başlık",
    type: "text",
    max: 160,
    hint: "Vurgulamak istediğiniz kelimeleri *yıldız* içine alın (italik görünür).",
  },
  { name: "heroLead", label: "Kapak – alt metin", type: "textarea", max: 400, rows: 3 },
  { name: "heroPrimaryCta", label: "Kapak – birinci bağlantı yazısı", type: "text", max: 40 },
  { name: "heroSecondaryCta", label: "Kapak – ikinci bağlantı yazısı", type: "text", max: 40 },
  { name: "aboutEyebrow", label: "Hakkımızda özeti – üst etiket", type: "text", max: 40 },
  { name: "aboutTitle", label: "Hakkımızda özeti – başlık", type: "text", max: 160 },
  {
    name: "aboutBody",
    label: "Hakkımızda özeti – metin",
    type: "textarea",
    max: 1600,
    rows: 8,
    hint: "Paragrafları bir boş satırla ayırın.",
  },
  { name: "aboutLinkLabel", label: "Hakkımızda özeti – bağlantı yazısı", type: "text", max: 40 },
  { name: "practiceTitle", label: "Çalışma alanları – başlık", type: "text", max: 80 },
  { name: "practiceIntro", label: "Çalışma alanları – kısa açıklama", type: "textarea", max: 300, rows: 2 },
  { name: "teamTitle", label: "Ekip – başlık", type: "text", max: 80 },
  { name: "teamIntro", label: "Ekip – kısa açıklama", type: "textarea", max: 300, rows: 2 },
  {
    name: "approachStatement",
    label: "Çalışma Yaklaşımımız – büyük ifade (koyu bölüm)",
    type: "textarea",
    max: 200,
    rows: 2,
    hint: "Kısa, tek cümlelik bir ilke ifadesi; iddia/reklam dili değil.",
  },
  { name: "publicationsTitle", label: "Yayınlar – başlık", type: "text", max: 80 },
  { name: "publicationsIntro", label: "Yayınlar – kısa açıklama", type: "textarea", max: 300, rows: 2 },
  { name: "publicationsEmpty", label: "Yayınlar – henüz yayın yokken gösterilecek metin", type: "textarea", max: 300, rows: 2 },
  { name: "contactTitle", label: "İletişim bölümü – başlık", type: "text", max: 100 },
  { name: "contactText", label: "İletişim bölümü – metin", type: "textarea", max: 400, rows: 3 },
  { name: "contactCtaLabel", label: "İletişim bölümü – düğme yazısı", type: "text", max: 40 },

  // İngilizce (/en) — yukarıdaki alanların İngilizce karşılığı. Boş bırakılırsa /en sayfasında da Türkçesi görünür.
  { name: "heroEyebrow_en", label: "İngilizce — Kapak – üst etiket", type: "text", max: 60 },
  { name: "heroTitle_en", label: "İngilizce — Kapak – ana başlık", type: "text", max: 160, hint: "Vurgu için *yıldız* kullanın." },
  { name: "heroLead_en", label: "İngilizce — Kapak – alt metin", type: "textarea", max: 400, rows: 3 },
  { name: "heroPrimaryCta_en", label: "İngilizce — Kapak – birinci bağlantı yazısı", type: "text", max: 40 },
  { name: "heroSecondaryCta_en", label: "İngilizce — Kapak – ikinci bağlantı yazısı", type: "text", max: 40 },
  { name: "aboutEyebrow_en", label: "İngilizce — Hakkımızda özeti – üst etiket", type: "text", max: 40 },
  { name: "aboutTitle_en", label: "İngilizce — Hakkımızda özeti – başlık", type: "text", max: 160 },
  { name: "aboutBody_en", label: "İngilizce — Hakkımızda özeti – metin", type: "textarea", max: 1600, rows: 8 },
  { name: "aboutLinkLabel_en", label: "İngilizce — Hakkımızda özeti – bağlantı yazısı", type: "text", max: 40 },
  { name: "practiceTitle_en", label: "İngilizce — Çalışma alanları – başlık", type: "text", max: 80 },
  { name: "practiceIntro_en", label: "İngilizce — Çalışma alanları – kısa açıklama", type: "textarea", max: 300, rows: 2 },
  { name: "teamTitle_en", label: "İngilizce — Ekip – başlık", type: "text", max: 80 },
  { name: "teamIntro_en", label: "İngilizce — Ekip – kısa açıklama", type: "textarea", max: 300, rows: 2 },
  { name: "approachStatement_en", label: "İngilizce — Çalışma Yaklaşımımız – büyük ifade", type: "textarea", max: 200, rows: 2 },
  { name: "publicationsTitle_en", label: "İngilizce — Yayınlar – başlık", type: "text", max: 80 },
  { name: "publicationsIntro_en", label: "İngilizce — Yayınlar – kısa açıklama", type: "textarea", max: 300, rows: 2 },
  { name: "publicationsEmpty_en", label: "İngilizce — Yayınlar – henüz yayın yokken gösterilecek metin", type: "textarea", max: 300, rows: 2 },
  { name: "contactTitle_en", label: "İngilizce — İletişim bölümü – başlık", type: "text", max: 100 },
  { name: "contactText_en", label: "İngilizce — İletişim bölümü – metin", type: "textarea", max: 400, rows: 3 },
  { name: "contactCtaLabel_en", label: "İngilizce — İletişim bölümü – düğme yazısı", type: "text", max: 40 },
];

export const HOME_DEFAULTS: Record<string, string> = {
  heroEyebrow: "LRN HUKUK · ANKARA",
  heroTitle: "Hukuki süreçlere *özenli, açık* ve bütüncül yaklaşım.",
  heroLead:
    "LRN Hukuk, Ankara merkezli bir hukuk bürosudur. Bireysel ve kurumsal hukuki süreçlerde; iş ve sosyal güvenlik, ceza, sağlık, şirketler, ticaret, aile ve idare hukuku alanlarında çalışırız.",
  heroPrimaryCta: "Çalışma Alanlarımız",
  heroSecondaryCta: "Büromuzu Tanıyın",
  aboutEyebrow: "Hakkımızda",
  aboutTitle: "Hukuki meseleleri bütüncül ve dikkatli bir yaklaşımla ele alıyoruz.",
  aboutBody:
    "Her hukuki mesele; kendi olguları, belgeleri ve süreleriyle birlikte değerlendirilmelidir. Bu nedenle çalışmalarımızın merkezinde dosyanın titizlikle incelenmesi, hukuki durumun açık bir dille aktarılması ve mesleki sorumluluğun gerektirdiği özen yer alır.\n\nBireysel ve kurumsal dosyalarda, farklı hukuk dallarının kesiştiği hususları birlikte ele alarak süreci bütünlük içinde yürütmeyi önemseriz.\n\nGizlilik ve mesleki etik ilkeleri, çalışma biçimimizin ayrılmaz bir parçasıdır.",
  aboutLinkLabel: "Hakkımızda",
  practiceTitle: "Çalışma Alanlarımız",
  practiceIntro: "Aşağıdaki hukuk alanlarında bireysel ve kurumsal hukuki süreçlerde çalışıyoruz.",
  teamTitle: "Ekibimiz",
  teamIntro: "Büromuzun avukatları ve mesleki bilgileri.",
  approachStatement: "Her hukuki süreç, kendi koşulları içerisinde dikkatle değerlendirilmelidir.",
  publicationsTitle: "Yayınlar",
  publicationsIntro: "Hukuki gelişmeler ve genel bilgilendirme amacıyla hazırlanan yazılar.",
  publicationsEmpty: "Yayınlar bu bölümde yer alacaktır.",
  contactTitle: "LRN Hukuk ile İletişim",
  contactText:
    "Genel bilgi talepleriniz ve iletişim için büromuza aşağıdaki bilgiler ya da iletişim formu aracılığıyla ulaşabilirsiniz.",
  contactCtaLabel: "İletişim Bilgileri",

  heroEyebrow_en: "LRN LAW · ANKARA",
  heroTitle_en: "A *careful, open* and holistic approach to legal matters.",
  heroLead_en:
    "LRN Law is a law firm based in Ankara. We handle individual and corporate legal matters in labour and social security, criminal, health, corporate, commercial, family and administrative law.",
  heroPrimaryCta_en: "Practice Areas",
  heroSecondaryCta_en: "About Our Firm",
  aboutEyebrow_en: "About Us",
  aboutTitle_en: "We approach legal matters holistically and with care.",
  aboutBody_en:
    "Every legal matter must be assessed together with its own facts, documents and deadlines. For this reason, our work centres on a careful review of the file, a clear explanation of the legal situation, and the diligence that professional responsibility requires.\n\nIn both individual and corporate matters, we take care to address issues that cross different areas of law together, so that the process is handled as a whole.\n\nConfidentiality and professional ethics are an integral part of how we work.",
  aboutLinkLabel_en: "About Us",
  practiceTitle_en: "Practice Areas",
  practiceIntro_en: "We work on individual and corporate legal matters in the areas of law below.",
  teamTitle_en: "Our Team",
  teamIntro_en: "The lawyers at our firm and their professional background.",
  approachStatement_en: "Every legal matter must be assessed carefully, on its own circumstances.",
  publicationsTitle_en: "Publications",
  publicationsIntro_en: "Articles prepared for general information on legal developments.",
  publicationsEmpty_en: "Publications will appear in this section.",
  contactTitle_en: "Contact LRN Law",
  contactText_en: "For general enquiries and to get in touch with our firm, you can use the details below or the contact form.",
  contactCtaLabel_en: "Contact Details",
};

/* ───────────────────────── Hakkımızda ───────────────────────── */

export const ABOUT_FIELDS: FieldDef[] = [
  { name: "intro", label: "Giriş metni (sayfa başı)", type: "textarea", max: 400, rows: 3 },
  { name: "officeTitle", label: "Büro – başlık", type: "text", max: 80 },
  { name: "officeText", label: "Büro – metin", type: "textarea", max: 1600, rows: 7, hint: "Paragrafları bir boş satırla ayırın." },
  { name: "approachTitle", label: "Yaklaşımımız – başlık", type: "text", max: 80 },
  { name: "approachText", label: "Yaklaşımımız – metin", type: "textarea", max: 1600, rows: 7 },
  { name: "workTitle", label: "Çalışma biçimimiz – başlık", type: "text", max: 80 },
  { name: "workText", label: "Çalışma biçimimiz – metin", type: "textarea", max: 1600, rows: 7 },
  { name: "principlesTitle", label: "İlkeler – başlık", type: "text", max: 80 },
  { name: "principle1Title", label: "İlke 1 – başlık", type: "text", max: 40 },
  { name: "principle1Text", label: "İlke 1 – açıklama", type: "textarea", max: 240, rows: 2 },
  { name: "principle2Title", label: "İlke 2 – başlık", type: "text", max: 40 },
  { name: "principle2Text", label: "İlke 2 – açıklama", type: "textarea", max: 240, rows: 2 },
  { name: "principle3Title", label: "İlke 3 – başlık", type: "text", max: 40 },
  { name: "principle3Text", label: "İlke 3 – açıklama", type: "textarea", max: 240, rows: 2 },
  { name: "principle4Title", label: "İlke 4 – başlık", type: "text", max: 40 },
  { name: "principle4Text", label: "İlke 4 – açıklama", type: "textarea", max: 240, rows: 2 },

  // İngilizce (/en)
  { name: "intro_en", label: "İngilizce — Giriş metni (sayfa başı)", type: "textarea", max: 400, rows: 3 },
  { name: "officeTitle_en", label: "İngilizce — Büro – başlık", type: "text", max: 80 },
  { name: "officeText_en", label: "İngilizce — Büro – metin", type: "textarea", max: 1600, rows: 7 },
  { name: "approachTitle_en", label: "İngilizce — Yaklaşımımız – başlık", type: "text", max: 80 },
  { name: "approachText_en", label: "İngilizce — Yaklaşımımız – metin", type: "textarea", max: 1600, rows: 7 },
  { name: "workTitle_en", label: "İngilizce — Çalışma biçimimiz – başlık", type: "text", max: 80 },
  { name: "workText_en", label: "İngilizce — Çalışma biçimimiz – metin", type: "textarea", max: 1600, rows: 7 },
  { name: "principlesTitle_en", label: "İngilizce — İlkeler – başlık", type: "text", max: 80 },
  { name: "principle1Title_en", label: "İngilizce — İlke 1 – başlık", type: "text", max: 40 },
  { name: "principle1Text_en", label: "İngilizce — İlke 1 – açıklama", type: "textarea", max: 240, rows: 2 },
  { name: "principle2Title_en", label: "İngilizce — İlke 2 – başlık", type: "text", max: 40 },
  { name: "principle2Text_en", label: "İngilizce — İlke 2 – açıklama", type: "textarea", max: 240, rows: 2 },
  { name: "principle3Title_en", label: "İngilizce — İlke 3 – başlık", type: "text", max: 40 },
  { name: "principle3Text_en", label: "İngilizce — İlke 3 – açıklama", type: "textarea", max: 240, rows: 2 },
  { name: "principle4Title_en", label: "İngilizce — İlke 4 – başlık", type: "text", max: 40 },
  { name: "principle4Text_en", label: "İngilizce — İlke 4 – açıklama", type: "textarea", max: 240, rows: 2 },
];

export const ABOUT_DEFAULTS: Record<string, string> = {
  intro: "LRN Hukuk, Ankara merkezli; bireysel ve kurumsal hukuki süreçlerde çalışan bir hukuk bürosudur.",
  officeTitle: "LRN Hukuk",
  officeText:
    "LRN Hukuk, Ankara'da faaliyet gösteren bir hukuk bürosudur. Büromuz; iş ve sosyal güvenlik, ceza, sağlık, şirketler, ticaret, aile ve idare hukuku alanlarında bireylerin ve kurumların hukuki süreçlerinde çalışmaktadır.\n\nBüromuz küçük bir ekipten oluşur ve çalışmalarını avukatlık mesleğinin ilke ve kurallarına uygun biçimde yürütür.",
  approachTitle: "Yaklaşımımız",
  approachText:
    "Hukuki değerlendirmede dikkat, iletişimde açıklık, mesleki ilkelerde özen gösteririz. Her dosyada olgular, belgeler ve süreler birlikte ele alınır; hukuki durum ve süreç, ilgili kişiye anlaşılır bir dille aktarılır.\n\nÇalışmalarımızda gizlilik ve mesleki etik ilkelerine bağlılık esastır.",
  workTitle: "Çalışma biçimimiz",
  workText:
    "Bireysel ve kurumsal hukuki süreçlerin her biri, kendi koşulları içerisinde değerlendirilir. Bir sürecin nasıl sonuçlanacağı; olayın özelliklerine, delillere ve uygulanacak mevzuata bağlıdır. Bu nedenle hiçbir süreç için önceden sonuç öngörüsünde veya vaadinde bulunulmaz.\n\nDosya bilgileri ve belgeler, mesleki gizlilik yükümlülüğü çerçevesinde korunur.",
  principlesTitle: "İlkelerimiz",
  principle1Title: "Özen",
  principle1Text: "Her dosya, gerektirdiği dikkat ve titizlikle incelenir.",
  principle2Title: "Gizlilik",
  principle2Text: "Dosya bilgileri, mesleki sır saklama yükümlülüğü çerçevesinde korunur.",
  principle3Title: "Açıklık",
  principle3Text: "Hukuki durum ve süreç, anlaşılır bir dille ve düzenli olarak aktarılır.",
  principle4Title: "Mesleki Etik",
  principle4Text: "Çalışmalar, avukatlık mesleğinin ilke ve kurallarına uygun yürütülür.",

  intro_en: "LRN Law is a law firm based in Ankara, working on individual and corporate legal matters.",
  officeTitle_en: "LRN Law",
  officeText_en:
    "LRN Law is a law firm operating in Ankara. Our firm works on the legal matters of individuals and organisations in the areas of labour and social security, criminal, health, corporate, commercial, family and administrative law.\n\nOur firm is a small team and conducts its work in line with the principles and rules of the legal profession.",
  approachTitle_en: "Our Approach",
  approachText_en:
    "We bring care to legal assessment, openness to communication, and diligence to professional principles. In every file, the facts, documents and deadlines are considered together; the legal situation and the process are explained to the person concerned in clear language.\n\nCommitment to confidentiality and professional ethics is fundamental to how we work.",
  workTitle_en: "How We Work",
  workText_en:
    "Each individual and corporate legal matter is assessed on its own circumstances. How a matter concludes depends on the specifics of the case, the evidence and the applicable legislation; for this reason, no process is prejudged or promised an outcome in advance.\n\nFile information and documents are protected under the obligation of professional confidentiality.",
  principlesTitle_en: "Our Principles",
  principle1Title_en: "Diligence",
  principle1Text_en: "Every file is examined with the care and attention it requires.",
  principle2Title_en: "Confidentiality",
  principle2Text_en: "File information is protected under the obligation of professional secrecy.",
  principle3Title_en: "Openness",
  principle3Text_en: "The legal situation and the process are communicated clearly and regularly.",
  principle4Title_en: "Professional Ethics",
  principle4Text_en: "Our work is carried out in line with the principles and rules of the legal profession.",
};

/* ───────────────────────── Hukuki sayfalar (YER TUTUCU) ───────────────────────── */

export type PageKey = "home" | "about" | "kvkk" | "cookies" | "privacy" | "terms";

export const PAGE_META: Record<PageKey, { title: string; path: string; kind: "structured" | "richtext"; description: string }> = {
  home: { title: "Ana Sayfa", path: "/", kind: "structured", description: "Ana sayfadaki kısa metinler ve bölüm başlıkları." },
  about: { title: "Hakkımızda", path: "/hakkimizda", kind: "structured", description: "Hakkımızda sayfasının metinleri ve ilkeler." },
  kvkk: { title: "KVKK Aydınlatma Metni", path: "/kvkk", kind: "richtext", description: "İletişim formundaki bağlantının gösterdiği aydınlatma metni." },
  cookies: { title: "Çerez Politikası", path: "/cerez-politikasi", kind: "richtext", description: "Çerez kullanımı hakkında bilgilendirme metni." },
  privacy: { title: "Gizlilik", path: "/gizlilik", kind: "richtext", description: "Gizlilik bildirimi." },
  terms: { title: "Kullanım Koşulları", path: "/kullanim-kosullari", kind: "richtext", description: "İnternet sitesi kullanım koşulları." },
};

export const PAGE_KEYS = Object.keys(PAGE_META) as PageKey[];
export const isPageKey = (v: string): v is PageKey => v in PAGE_META;

export const LEGAL_DEFAULTS: Record<"kvkk" | "cookies" | "privacy" | "terms", string> = {
  kvkk: `<p>Bu Aydınlatma Metni, 6698 sayılı Kişisel Verilerin Korunması Kanunu'nun 10. maddesi uyarınca, iletişim formu aracılığıyla toplanan kişisel verilerin işlenmesine ilişkin bilgilendirme amacıyla hazırlanmıştır.</p>
<h2>1. Veri sorumlusu</h2>
<p>Veri sorumlusu: [Veri sorumlusunun unvanı / adı soyadı]. Adres: [Adres]. E-posta: [E-posta adresi].</p>
<h2>2. İşlenen kişisel veriler</h2>
<p>İletişim formunu doldurmanız halinde ad soyad, e-posta adresi, (isteğe bağlı olarak) telefon numarası, konu ve mesaj içeriği işlenmektedir. Formda özel nitelikli kişisel veri paylaşılmaması istenmektedir.</p>
<h2>3. İşleme amacı ve hukuki sebep</h2>
<p>Kişisel verileriniz, iletişim talebinizin alınması, değerlendirilmesi ve yanıtlanması amacıyla işlenmektedir. Hukuki sebep: [Hukuki sebep — örn. veri sorumlusunun meşru menfaati / ilgili kişinin talebi; hukukçu tarafından belirlenmelidir].</p>
<h2>4. Aktarım</h2>
<p>Kişisel verileriniz, [aktarım yapılıyorsa alıcı grupları ve amaçlar; örn. e-posta ve barındırma hizmeti sağlayıcıları] dışında üçüncü kişilerle paylaşılmamaktadır.</p>
<h2>5. Toplama yöntemi</h2>
<p>Verileriniz, internet sitesindeki iletişim formu aracılığıyla elektronik ortamda toplanmaktadır.</p>
<h2>6. Saklama süresi</h2>
<p>Kişisel verileriniz, işleme amacının gerektirdiği süre boyunca ve en fazla [saklama süresi] süreyle saklanmakta, sürenin sonunda silinmekte veya anonim hâle getirilmektedir.</p>
<h2>7. İlgili kişinin hakları</h2>
<p>KVKK'nın 11. maddesi kapsamında; kişisel verilerinizin işlenip işlenmediğini öğrenme, bilgi talep etme, düzeltilmesini veya silinmesini isteme ve mevzuatta yer alan diğer haklara sahipsiniz.</p>
<h2>8. Başvuru</h2>
<p>Haklarınıza ilişkin taleplerinizi [başvuru yöntemi ve adresi] üzerinden iletebilirsiniz.</p>`,

  cookies: `<p>Bu internet sitesinde çerez kullanımı en aza indirilmiştir. Bu metin, hangi çerezlerin hangi amaçla kullanılabileceğini açıklar.</p>
<h2>Zorunlu çerezler</h2>
<p>Sitenin çalışması için gereklidir ve kapatılamaz. Çerez tercihinizi hatırlamak için kullanılan tercih çerezi (<strong>lrn_consent</strong>) bu kategoridedir.</p>
<h2>Analitik çerezler</h2>
<p>Yalnızca <strong>sizin onayınızla</strong> ve site sahibi Google Analytics'i etkinleştirmişse kullanılır. Ziyaretçi sayısı ve sayfa kullanımı gibi istatistikleri toplu olarak anlamamıza yardımcı olur (<strong>_ga</strong>, <strong>_ga_*</strong>). Onay vermezseniz analitik çerezler çalışmaz. Tercihinizi sayfa altındaki "Çerez Tercihleri" bağlantısından dilediğiniz zaman değiştirebilirsiniz.</p>
<h2>Üçüncü taraf içerik</h2>
<p>İletişim sayfasındaki harita, yalnızca "Haritayı yükle" seçeneğini kullandığınızda üçüncü taraf bir hizmetten yüklenir; bu sırada ilgili hizmet kendi çerezlerini kullanabilir.</p>
<h2>Çerezleri yönetme</h2>
<p>Tarayıcı ayarlarınızdan çerezleri silebilir veya engelleyebilirsiniz. [Nihai metin, hukukçu tarafından gözden geçirilmelidir.]</p>`,

  privacy: `<p>[Gizlilik bildirimi — büronun internet sitesi ziyaretçilerine ilişkin gizlilik yaklaşımı ve kişisel verilerin korunmasına ilişkin genel açıklamalar buraya yazılmalıdır.]</p>
<h2>Toplanan bilgiler</h2>
<p>Bu internet sitesi, yalnızca iletişim formunu doldurmanız halinde sağladığınız bilgileri ve (onayınızla) toplu istatistik verilerini işler. Ayrıntılar için KVKK Aydınlatma Metni ve Çerez Politikası'na bakınız.</p>
<h2>Mesleki gizlilik</h2>
<p>İletişim formu üzerinden özel nitelikli kişisel veri veya dosya detayları paylaşılmaması önerilir. Hukuki bir ilişki kurulmadan önce iletilen bilgilerin kapsamı hakkında [hukukçu tarafından tamamlanacak açıklama].</p>`,

  terms: `<p>Bu internet sitesindeki bilgiler genel bilgilendirme amacıyla sunulmaktadır.</p>
<h2>Hukuki danışmanlık değildir</h2>
<p>Sitede yer alan içerikler hukuki görüş veya danışmanlık niteliği taşımaz; bir hukuki meselenin somut koşullarına göre değerlendirilmesinin yerine geçmez. Siteyi ziyaret etmek veya iletişim formu göndermek, avukat–müvekkil ilişkisi kurulduğu anlamına gelmez.</p>
<h2>Fikri mülkiyet</h2>
<p>Site içeriği, izin alınmaksızın çoğaltılamaz veya ticari amaçla kullanılamaz.</p>
<h2>Üçüncü taraf bağlantılar</h2>
<p>Sitede yer alan üçüncü taraf bağlantıların içeriğinden büro sorumlu değildir.</p>
<p>[Nihai metin, hukukçu tarafından gözden geçirilmelidir.]</p>`,
};
