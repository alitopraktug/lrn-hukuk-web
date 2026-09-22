"use server";

import { formToObject, type ActionState } from "@/lib/actions";
import { processContact } from "@/lib/contact";
import { getClientIp } from "@/lib/request";
import type { Locale } from "@/lib/i18n/config";

/**
 * İletişim formu Server Action'ı. İş mantığı lib/contact.ts içindedir (honeypot, hız sınırı, Zod, Turnstile, DB + SMTP).
 * Hata durumunda, kullanıcının yazdıkları geri döndürülür (React 19 form sıfırlaması yazılanları silmesin diye).
 * Form gizli bir "locale" alanı gönderir (/en altında doğrulama/hata mesajları İngilizce olsun diye).
 */
export async function submitContact(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const raw = formToObject(formData);
  const ip = await getClientIp();
  const locale: Locale = formData.get("locale") === "en" ? "en" : "tr";
  const result = await processContact(raw, { ip, locale });
  if (result.status === "error") {
    const str = (k: string) => (typeof raw[k] === "string" ? (raw[k] as string).slice(0, 4100) : "");
    return {
      ...result,
      values: { name: str("name"), email: str("email"), phone: str("phone"), subject: str("subject"), message: str("message"), consent: str("consent") },
    };
  }
  return result;
}
