import { z } from "zod";

/**
 * İletişim formu şeması — hem tarayıcıda (anında geri bildirim) hem sunucuda (asıl doğrulama) kullanılır.
 * Veri minimizasyonu: yalnızca gerekli alanlar istenir; telefon isteğe bağlıdır.
 */
import { CONTACT_LIMITS } from "@/lib/validation/contact-limits";
export { CONTACT_LIMITS };

const noControl = (v: string) => !/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/.test(v);

export const contactSchema = z.object({
  name: z
    .string({ error: "Lütfen adınızı ve soyadınızı giriniz." })
    .trim()
    .min(2, "Lütfen adınızı ve soyadınızı giriniz.")
    .max(CONTACT_LIMITS.name, `Ad soyad en fazla ${CONTACT_LIMITS.name} karakter olabilir.`)
    .refine(noControl, "Geçersiz karakter içeriyor."),
  email: z
    .string({ error: "Lütfen e-posta adresinizi giriniz." })
    .trim()
    .min(1, "Lütfen e-posta adresinizi giriniz.")
    .max(CONTACT_LIMITS.email, "E-posta adresi çok uzun.")
    .email("Lütfen geçerli bir e-posta adresi giriniz."),
  phone: z
    .string()
    .trim()
    .max(CONTACT_LIMITS.phone, "Telefon numarası çok uzun.")
    .regex(/^[0-9+()\-\s]*$/, "Telefon numarası yalnızca rakam ve + ( ) - karakterlerini içerebilir.")
    .optional()
    .default(""),
  subject: z
    .string({ error: "Lütfen konu giriniz." })
    .trim()
    .min(3, "Lütfen konu giriniz (en az 3 karakter).")
    .max(CONTACT_LIMITS.subject, `Konu en fazla ${CONTACT_LIMITS.subject} karakter olabilir.`)
    .refine(noControl, "Geçersiz karakter içeriyor."),
  message: z
    .string({ error: "Lütfen mesajınızı yazınız." })
    .trim()
    .min(10, "Mesajınız en az 10 karakter olmalıdır.")
    .max(CONTACT_LIMITS.message, `Mesajınız en fazla ${CONTACT_LIMITS.message} karakter olabilir.`)
    .refine(noControl, "Geçersiz karakter içeriyor."),
  consent: z
    .string({ error: "Devam etmek için aydınlatma metnini okuduğunuzu onaylamanız gerekir." })
    .refine((v) => v === "on" || v === "true", "Devam etmek için aydınlatma metnini okuduğunuzu onaylamanız gerekir."),
});

export type ContactInput = z.infer<typeof contactSchema>;

/** Sunucuya ek olarak gönderilen bot koruma alanları (şemanın dışında tutulur). */
export type ContactGuards = {
  /** Honeypot — gerçek kullanıcılar görmez/doldurmaz; dolu ise bot kabul edilir. */
  website?: string;
  /** Formun tarayıcıda açıldığı an (ms). Çok hızlı gönderimler reddedilir. */
  startedAt?: number;
  turnstileToken?: string;
};
