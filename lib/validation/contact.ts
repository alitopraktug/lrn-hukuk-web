import { z } from "zod";
import type { Locale } from "@/lib/i18n/config";

/**
 * İletişim formu şeması — hem tarayıcıda (anında geri bildirim) hem sunucuda (asıl doğrulama) kullanılır.
 * Veri minimizasyonu: yalnızca gerekli alanlar istenir; telefon isteğe bağlıdır.
 * `buildContactSchema(locale)`: hata mesajları dile göre üretilir; `contactSchema` (TR) geriye dönük uyumluluk
 * için ayrıca dışa aktarılır — mevcut çağıranlar (testler dahil) değişmeden çalışmaya devam eder.
 */
import { CONTACT_LIMITS } from "@/lib/validation/contact-limits";
export { CONTACT_LIMITS };

const noControl = (v: string) => !/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/.test(v);

const MSG: Record<Locale, Record<string, string | ((n: number) => string)>> = {
  tr: {
    nameRequired: "Lütfen adınızı ve soyadınızı giriniz.",
    nameMax: (n) => `Ad soyad en fazla ${n} karakter olabilir.`,
    invalidChar: "Geçersiz karakter içeriyor.",
    emailRequired: "Lütfen e-posta adresinizi giriniz.",
    emailMax: "E-posta adresi çok uzun.",
    emailInvalid: "Lütfen geçerli bir e-posta adresi giriniz.",
    phoneMax: "Telefon numarası çok uzun.",
    phoneInvalid: "Telefon numarası yalnızca rakam ve + ( ) - karakterlerini içerebilir.",
    subjectRequired: "Lütfen konu giriniz.",
    subjectMin: "Lütfen konu giriniz (en az 3 karakter).",
    subjectMax: (n) => `Konu en fazla ${n} karakter olabilir.`,
    messageRequired: "Lütfen mesajınızı yazınız.",
    messageMin: "Mesajınız en az 10 karakter olmalıdır.",
    messageMax: (n) => `Mesajınız en fazla ${n} karakter olabilir.`,
    consent: "Devam etmek için aydınlatma metnini okuduğunuzu onaylamanız gerekir.",
  },
  en: {
    nameRequired: "Please enter your full name.",
    nameMax: (n) => `Full name can be at most ${n} characters.`,
    invalidChar: "Contains an invalid character.",
    emailRequired: "Please enter your email address.",
    emailMax: "Email address is too long.",
    emailInvalid: "Please enter a valid email address.",
    phoneMax: "Phone number is too long.",
    phoneInvalid: "Phone number may only contain digits and + ( ) - characters.",
    subjectRequired: "Please enter a subject.",
    subjectMin: "Please enter a subject (at least 3 characters).",
    subjectMax: (n) => `Subject can be at most ${n} characters.`,
    messageRequired: "Please write your message.",
    messageMin: "Your message must be at least 10 characters.",
    messageMax: (n) => `Message can be at most ${n} characters.`,
    consent: "To continue, please confirm you have read the privacy notice.",
  },
};

export function buildContactSchema(locale: Locale = "tr") {
  const m = MSG[locale];
  const s = (key: string) => m[key] as string;
  const n = (key: string, arg: number) => (m[key] as (n: number) => string)(arg);
  return z.object({
    name: z
      .string({ error: s("nameRequired") })
      .trim()
      .min(2, s("nameRequired"))
      .max(CONTACT_LIMITS.name, n("nameMax", CONTACT_LIMITS.name))
      .refine(noControl, s("invalidChar")),
    email: z
      .string({ error: s("emailRequired") })
      .trim()
      .min(1, s("emailRequired"))
      .max(CONTACT_LIMITS.email, s("emailMax"))
      .email(s("emailInvalid")),
    phone: z
      .string()
      .trim()
      .max(CONTACT_LIMITS.phone, s("phoneMax"))
      .regex(/^[0-9+()\-\s]*$/, s("phoneInvalid"))
      .optional()
      .default(""),
    subject: z
      .string({ error: s("subjectRequired") })
      .trim()
      .min(3, s("subjectMin"))
      .max(CONTACT_LIMITS.subject, n("subjectMax", CONTACT_LIMITS.subject))
      .refine(noControl, s("invalidChar")),
    message: z
      .string({ error: s("messageRequired") })
      .trim()
      .min(10, s("messageMin"))
      .max(CONTACT_LIMITS.message, n("messageMax", CONTACT_LIMITS.message))
      .refine(noControl, s("invalidChar")),
    consent: z.string({ error: s("consent") }).refine((v) => v === "on" || v === "true", s("consent")),
  });
}

/** Türkçe şema — geriye dönük uyumluluk (bkz. yukarıdaki not). */
export const contactSchema = buildContactSchema("tr");

export type ContactInput = z.infer<typeof contactSchema>;

/** Sunucuya ek olarak gönderilen bot koruma alanları (şemanın dışında tutulur). */
export type ContactGuards = {
  /** Honeypot — gerçek kullanıcılar görmez/doldurmaz; dolu ise bot kabul edilir. */
  website?: string;
  /** Formun tarayıcıda açıldığı an (ms). Çok hızlı gönderimler reddedilir. */
  startedAt?: number;
  turnstileToken?: string;
};
