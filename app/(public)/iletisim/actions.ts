"use server";

import { formToObject, type ActionState } from "@/lib/actions";
import { processContact } from "@/lib/contact";
import { getClientIp } from "@/lib/request";

/**
 * İletişim formu Server Action'ı. İş mantığı lib/contact.ts içindedir (honeypot, hız sınırı, Zod, Turnstile, DB + SMTP).
 * Hata durumunda, kullanıcının yazdıkları geri döndürülür (React 19 form sıfırlaması yazılanları silmesin diye).
 */
export async function submitContact(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const raw = formToObject(formData);
  const ip = await getClientIp();
  const result = await processContact(raw, { ip });
  if (result.status === "error") {
    const str = (k: string) => (typeof raw[k] === "string" ? (raw[k] as string).slice(0, 4100) : "");
    return {
      ...result,
      values: { name: str("name"), email: str("email"), phone: str("phone"), subject: str("subject"), message: str("message"), consent: str("consent") },
    };
  }
  return result;
}
