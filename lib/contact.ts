import "server-only";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { rateLimit, retryMessage } from "@/lib/rate-limit";
import { rateKey } from "@/lib/request";
import { contactSchema } from "@/lib/validation/contact";
import { errorState, successState, zodFieldErrors, type ActionState } from "@/lib/actions";
import { getSiteSettings } from "@/lib/data/site";
import { isEmailConfigured, sendContactNotification } from "@/lib/email";
import { multiLine, singleLine } from "@/lib/text";
import { verifyTurnstile } from "@/lib/turnstile";

/**
 * İletişim formu işleme hattı (Server Action'dan bağımsız, test edilebilir):
 *  honeypot → hız sınırı → Zod doğrulama → süre kontrolü → Turnstile (varsa) → DB kaydı (isteğe bağlı) + SMTP bildirimi.
 * Veri minimizasyonu: IP adresi mesajla birlikte SAKLANMAZ; yalnızca hız sınırı için anahtarlı özet olarak kullanılır.
 */
export type ContactContext = { ip: string; now?: number };

const MIN_FILL_MS = 3000;
const SUCCESS = "Mesajınız iletildi. İlginiz için teşekkür ederiz; yanıt için e-posta adresiniz kullanılacaktır.";

export async function processContact(raw: Record<string, unknown>, ctx: ContactContext): Promise<ActionState> {
  const now = ctx.now ?? Date.now();

  // 1) Honeypot: insanlar bu gizli alanı doldurmaz. Botu bilgilendirmeden "başarılı" gibi yanıtla.
  if (typeof raw.website === "string" && raw.website.trim() !== "") return successState(SUCCESS);

  // 2) IP başına hız sınırı
  const ipLimit = await rateLimit(rateKey("contact-ip", ctx.ip), 6, 60 * 60);
  if (!ipLimit.ok) return errorState(`Kısa sürede çok fazla mesaj gönderildi. ${retryMessage(ipLimit.retryAfterSeconds)}`);

  // 3) Sunucu tarafı doğrulama (istemcideki ile aynı şema)
  const parsed = contactSchema.safeParse(raw);
  if (!parsed.success) {
    return { status: "error", message: "Lütfen işaretli alanları kontrol edin.", fieldErrors: zodFieldErrors(parsed.error) };
  }
  const input = parsed.data;

  // 4) Çok hızlı gönderim (bot davranışı)
  const startedAt = Number(raw.startedAt);
  if (Number.isFinite(startedAt) && startedAt > 0 && now - startedAt < MIN_FILL_MS) {
    return errorState("Formu göndermeden önce lütfen birkaç saniye bekleyip tekrar deneyin.");
  }

  // 5) E-posta başına hız sınırı
  const emailLimit = await rateLimit(rateKey("contact-email", input.email), 3, 60 * 60);
  if (!emailLimit.ok) return errorState(`Bu e-posta adresiyle kısa sürede çok fazla mesaj gönderildi. ${retryMessage(emailLimit.retryAfterSeconds)}`);

  // 6) Turnstile (yapılandırılmışsa)
  const token = typeof raw["cf-turnstile-response"] === "string" ? (raw["cf-turnstile-response"] as string) : undefined;
  if (!(await verifyTurnstile(token, ctx.ip))) {
    return errorState("Güvenlik doğrulaması tamamlanamadı. Lütfen sayfayı yenileyip tekrar deneyin.");
  }

  // 7) Kayıt + bildirim
  const settings = await getSiteSettings();
  const recipient = settings.contactRecipientEmail || env.contactToEmail;
  const canEmail = isEmailConfigured() && Boolean(recipient);
  const store = settings.storeContactMessages;

  const clean = {
    name: singleLine(input.name),
    email: input.email.toLowerCase(),
    phone: input.phone ? singleLine(input.phone) : null,
    subject: singleLine(input.subject),
    message: multiLine(input.message),
  };

  if (!store && !canEmail) {
    console.error("[contact] Mesaj alınamadı: ne veritabanı kaydı ne de SMTP bildirimi etkin.");
    return errorState("Mesajınız şu anda alınamıyor. Lütfen daha sonra tekrar deneyin veya iletişim bilgilerimizi kullanın.");
  }

  const receivedAt = new Date(now);
  let recordId: string | null = null;
  if (store) {
    const record = await db.contactMessage.create({
      data: {
        ...clean,
        consentAt: receivedAt,
        purgeAfter: new Date(now + Math.max(1, settings.messageRetentionDays) * 24 * 60 * 60 * 1000),
      },
      select: { id: true },
    });
    recordId = record.id;
  }

  let emailed = false;
  if (canEmail && recipient) {
    try {
      await sendContactNotification(recipient, { ...clean, receivedAt });
      emailed = true;
      if (recordId) await db.contactMessage.update({ where: { id: recordId }, data: { emailSent: true } });
    } catch (error) {
      console.error("[contact] SMTP gönderimi başarısız:", error instanceof Error ? error.message : error);
    }
  }

  if (!recordId && !emailed) {
    return errorState("Mesajınız gönderilemedi. Lütfen daha sonra tekrar deneyin veya iletişim bilgilerimizi kullanın.");
  }
  return successState(SUCCESS);
}
