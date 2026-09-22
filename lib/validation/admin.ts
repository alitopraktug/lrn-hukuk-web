import { z } from "zod";
import { SLUG_PATTERN } from "@/lib/slug";
import { safeMapEmbedUrl } from "@/lib/map";
import { multiLine, singleLine, splitLines } from "@/lib/text";

/**
 * Yönetim paneli form şemaları. Tüm alanlar sunucuda doğrulanır (istemci doğrulaması yalnızca kolaylıktır).
 * Boş metin alanları isteğe bağlı alanlarda `null`a çevrilir.
 */

const req = (label: string, max: number) =>
  z
    .string({ error: `${label} zorunludur.` })
    .transform(singleLine)
    .pipe(z.string().min(1, `${label} zorunludur.`).max(max, `${label} en fazla ${max} karakter olabilir.`));

const text = (max: number, label = "Bu alan") =>
  z
    .string()
    .optional()
    .default("")
    .transform(singleLine)
    .pipe(z.string().max(max, `${label} en fazla ${max} karakter olabilir.`));

const longText = (max: number, label = "Bu alan") =>
  z
    .string()
    .optional()
    .default("")
    .transform(multiLine)
    .pipe(z.string().max(max, `${label} en fazla ${max} karakter olabilir.`));

const optText = (max: number, label = "Bu alan") => text(max, label).transform((v) => v || null);

export const checkbox = z
  .string()
  .optional()
  .transform((v) => v === "on" || v === "true");

const idOrNull = z
  .string()
  .optional()
  .transform((v) => (v && v.trim() ? v.trim() : null))
  .pipe(z.string().max(40).nullable());

const idList = z.preprocess(
  (v) => (v === undefined || v === "" ? [] : Array.isArray(v) ? v : [v]),
  z.array(z.string().min(1).max(40)).max(200),
);

const lines = (maxLen: number, maxItems: number, label: string) =>
  z
    .string()
    .optional()
    .default("")
    .transform(splitLines)
    .pipe(z.array(z.string().max(maxLen, `${label}: her satır en fazla ${maxLen} karakter olabilir.`)).max(maxItems, `${label}: en fazla ${maxItems} satır girilebilir.`));

const slug = z
  .string()
  .optional()
  .default("")
  .transform((v) => v.trim().toLowerCase())
  .refine((v) => v === "" || (SLUG_PATTERN.test(v) && v.length <= 100), "Adres yalnızca küçük harf (a-z), rakam ve tire içerebilir.");

const html = (max = 400_000) => z.string().optional().default("").pipe(z.string().max(max, "İçerik çok uzun."));

/** datetime-local ("2026-09-21T14:30") → UTC Date. Türkiye kalıcı olarak UTC+3'tedir. */
const dateTimeTR = z
  .string()
  .optional()
  .transform((v, ctx) => {
    const s = (v ?? "").trim();
    if (!s) return null;
    const d = new Date(`${s.length === 16 ? `${s}:00` : s}+03:00`);
    if (Number.isNaN(d.getTime())) {
      ctx.addIssue({ code: "custom", message: "Geçerli bir tarih girin." });
      return z.NEVER;
    }
    return d;
  });

const dateOnly = z
  .string()
  .optional()
  .transform((v, ctx) => {
    const s = (v ?? "").trim();
    if (!s) return null;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(s) || Number.isNaN(new Date(`${s}T00:00:00Z`).getTime())) {
      ctx.addIssue({ code: "custom", message: "Geçerli bir tarih girin." });
      return z.NEVER;
    }
    return new Date(`${s}T00:00:00Z`);
  });

const optEmail = z
  .string()
  .optional()
  .default("")
  .transform((v) => v.trim())
  .refine((v) => v === "" || z.email().safeParse(v).success, "Geçerli bir e-posta adresi girin.")
  .transform((v) => v || null);

const optUrl = (label: string) =>
  z
    .string()
    .optional()
    .default("")
    .transform((v) => v.trim())
    .refine((v) => v === "" || /^https?:\/\/[^\s]+$/i.test(v), `${label} için http:// veya https:// ile başlayan geçerli bir adres girin.`)
    .pipe(z.string().max(300));

/* ───────────────────────── Yayın ───────────────────────── */
export const publicationSchema = z.object({
  title: req("Başlık", 160),
  slug,
  excerpt: longText(320, "Özet"),
  content: html(),
  categoryId: idOrNull,
  tags: text(400),
  authorId: idOrNull,
  authorName: optText(100),
  featured: checkbox,
  publishedAt: dateTimeTR,
  seoTitle: optText(70, "SEO başlığı"),
  seoDescription: optText(170, "SEO açıklaması"),
  areaIds: idList,
  intent: z.enum(["save", "draft", "publish", "unpublish"]).default("save"),
  coverId: idOrNull,
  coverIdAlt: text(200),
  ogImageId: idOrNull,
  ogImageIdAlt: text(200),
});
export type PublicationInput = z.infer<typeof publicationSchema>;

export function parseTagNames(input: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of input.split(",")) {
    const name = singleLine(raw).slice(0, 40);
    const key = name.toLocaleLowerCase("tr-TR");
    if (name && !seen.has(key)) {
      seen.add(key);
      out.push(name);
    }
    if (out.length >= 10) break;
  }
  return out;
}

/* ───────────────────────── Çalışma alanı ───────────────────────── */
export const areaSchema = z.object({
  title: req("Başlık", 120),
  slug,
  shortDescription: longText(300, "Kısa açıklama"),
  content: html(),
  topics: lines(120, 14, "Konu başlıkları"),
  seoTitle: optText(70, "SEO başlığı"),
  seoDescription: optText(170, "SEO açıklaması"),
  teamIds: idList,
  publicationIds: idList,
  intent: z.enum(["save", "draft", "publish", "unpublish"]).default("save"),
  coverId: idOrNull,
  coverIdAlt: text(200),
  ogImageId: idOrNull,
  ogImageIdAlt: text(200),
});
export type AreaInput = z.infer<typeof areaSchema>;

/* ───────────────────────── Ekip ───────────────────────── */
export const TEAM_FIELD_KEYS = ["education", "barInfo", "careerStart", "languages", "writings", "practiceAreas", "email", "linkedin"] as const;

export const teamSchema = z.object({
  fullName: req("Ad soyad", 100),
  title: req("Unvan", 80),
  slug,
  shortBio: longText(400, "Kısa biyografi"),
  bio: html(60_000),
  education: lines(200, 10, "Eğitim"),
  barAssociation: optText(100, "Baro"),
  tbbNo: optText(30, "TBB sicil no"),
  barNo: optText(30, "Baro sicil no"),
  careerStart: dateOnly,
  languages: lines(60, 12, "Yabancı diller"),
  writings: lines(300, 30, "Yayınlar"),
  email: optEmail,
  linkedin: optUrl("LinkedIn"),
  photoPosition: z
    .string()
    .optional()
    .default("50% 25%")
    .transform((v) => v.trim())
    .refine((v) => /^\d{1,3}% \d{1,3}%$/.test(v), "Kadraj değeri geçersiz."),
  visible: idList,
  areaIds: idList,
  seoTitle: optText(70, "SEO başlığı"),
  seoDescription: optText(170, "SEO açıklaması"),
  intent: z.enum(["save", "draft", "publish", "unpublish"]).default("save"),
  photoId: idOrNull,
  photoIdAlt: text(200),
});
export type TeamInput = z.infer<typeof teamSchema>;

/* ───────────────────────── Ayarlar ───────────────────────── */
const socialUrl = (label: string) => optUrl(label);

export const settingsSchema = z.object({
  firmName: req("Büro adı", 80),
  phone: text(40),
  email: optEmail,
  address: longText(400, "Adres"),
  mapEmbedUrl: z
    .string()
    .optional()
    .default("")
    .transform((v) => v.trim())
    .refine((v) => v === "" || safeMapEmbedUrl(v) !== null, "Yalnızca Google Haritalar veya OpenStreetMap 'yerleştirme (embed)' adresleri kabul edilir (https://www.google.com/maps/embed?… gibi)."),
  workingHours: longText(300, "Çalışma saatleri"),
  linkedin: socialUrl("LinkedIn"),
  instagram: socialUrl("Instagram"),
  x: socialUrl("X"),
  facebook: socialUrl("Facebook"),
  footerText: longText(400, "Alt bilgi metni"),
  publicationDisclaimer: longText(600, "Yayın bilgilendirme notu"),
  contactNotice: longText(600, "Form uyarı metni"),
  contactConsentLabel: longText(400, "Onay metni"),
  contactRecipientEmail: optEmail,
  storeContactMessages: checkbox,
  messageRetentionDays: z.coerce.number({ error: "Geçerli bir sayı girin." }).int().min(30, "En az 30 gün.").max(3650, "En fazla 3650 gün."),
  gaMeasurementId: z
    .string()
    .optional()
    .default("")
    .transform((v) => v.trim().toUpperCase())
    .refine((v) => v === "" || /^G-[A-Z0-9]{4,20}$/.test(v), "Ölçüm kimliği G- ile başlamalıdır (örn. G-ABC123XYZ)."),
  logoId: idOrNull,
  logoIdAlt: text(200),
  faviconId: idOrNull,
  faviconIdAlt: text(200),
});
export type SettingsInput = z.infer<typeof settingsSchema>;

export const seoSchema = z.object({
  defaultTitle: req("Varsayılan başlık", 70),
  defaultDescription: longText(170, "Varsayılan açıklama"),
  googleSiteVerification: z
    .string()
    .optional()
    .default("")
    .transform((v) => v.trim())
    .refine((v) => v === "" || /^[A-Za-z0-9_-]{20,100}$/.test(v), "Doğrulama kodu yalnızca harf, rakam, - ve _ içerebilir."),
  ogImageId: idOrNull,
  ogImageIdAlt: text(200),
});
export type SeoInput = z.infer<typeof seoSchema>;

/* ───────────────────────── Sayfalar ───────────────────────── */
export const richPageSchema = z.object({
  title: req("Başlık", 120),
  content: html(120_000),
  seoTitle: optText(70, "SEO başlığı"),
  seoDescription: optText(170, "SEO açıklaması"),
  reviewed: checkbox,
});

/* ───────────────────────── Kullanıcılar / hesap ───────────────────────── */
export const createUserSchema = z.object({
  email: z
    .string({ error: "E-posta zorunludur." })
    .trim()
    .toLowerCase()
    .max(200)
    .pipe(z.email("Geçerli bir e-posta adresi girin.")),
  name: req("Ad soyad", 100),
  role: z.enum(["ADMIN", "EDITOR"], { error: "Rol seçin." }),
});

export const updateUserSchema = z.object({
  name: req("Ad soyad", 100),
  role: z.enum(["ADMIN", "EDITOR"], { error: "Rol seçin." }),
  active: checkbox,
});

export const changePasswordSchema = z
  .object({
    current: z.string({ error: "Mevcut parola zorunludur." }).min(1, "Mevcut parola zorunludur.").max(256),
    password: z.string({ error: "Yeni parola zorunludur." }).max(128),
    confirm: z.string({ error: "Parolayı tekrar girin." }).max(128),
  })
  .refine((v) => v.password === v.confirm, { path: ["confirm"], message: "Parolalar eşleşmiyor." });
