import "server-only";
import { db } from "@/lib/db";
import { audit } from "@/lib/audit";
import { rateLimit } from "@/lib/rate-limit";
import { rateKey } from "@/lib/request";
import { randomToken, sha256 } from "@/lib/auth/crypto";
import { hashPassword, passwordPolicyError } from "@/lib/auth/password";
import { isEmailConfigured, sendPasswordResetEmail } from "@/lib/email";

/**
 * Parola sıfırlama: tek kullanımlık, 30 dakika geçerli, veritabanında yalnızca SHA-256 özeti tutulan token.
 * İstek yanıtı, e-posta kayıtlı olsun olmasın aynıdır (kullanıcı varlığı sızmaz).
 */
const TOKEN_TTL_MS = 30 * 60 * 1000;

export async function requestPasswordReset(emailRaw: string, ip: string): Promise<void> {
  const email = emailRaw.trim().toLowerCase().slice(0, 200);
  const [byIp, byEmail] = await Promise.all([
    rateLimit(rateKey("reset-ip", ip), 5, 60 * 60),
    rateLimit(rateKey("reset-email", email), 3, 60 * 60),
  ]);
  if (!byIp.ok || !byEmail.ok) return; // sessizce yoksay

  await audit({ action: "password.reset.requested", userEmail: email });

  const user = await db.user.findUnique({ where: { email } });
  if (!user || !user.active) return;
  if (!isEmailConfigured()) {
    console.error("[reset] Parola sıfırlama e-postası gönderilemedi: SMTP yapılandırılmamış. Yönetici, `npm run admin:create -- --reset` ile parola belirleyebilir.");
    return;
  }

  const token = randomToken(32);
  await db.$transaction([
    db.passwordResetToken.deleteMany({ where: { userId: user.id } }),
    db.passwordResetToken.create({ data: { id: sha256(token), userId: user.id, expiresAt: new Date(Date.now() + TOKEN_TTL_MS) } }),
  ]);
  try {
    await sendPasswordResetEmail(user.email, token);
  } catch (error) {
    console.error("[reset] E-posta gönderilemedi:", error instanceof Error ? error.message : error);
  }
}

export async function validateResetToken(token: string): Promise<{ userId: string; email: string } | null> {
  if (!token || token.length > 128) return null;
  const record = await db.passwordResetToken.findUnique({ where: { id: sha256(token) }, include: { user: true } });
  if (!record || record.usedAt || record.expiresAt <= new Date() || !record.user.active) return null;
  return { userId: record.userId, email: record.user.email };
}

export async function completePasswordReset(token: string, newPassword: string): Promise<{ ok: true } | { ok: false; message: string }> {
  const valid = await validateResetToken(token);
  if (!valid) return { ok: false, message: "Bu bağlantının süresi dolmuş veya daha önce kullanılmış. Lütfen yeni bir sıfırlama isteyin." };

  const policy = passwordPolicyError(newPassword, { email: valid.email });
  if (policy) return { ok: false, message: policy };

  const passwordHash = await hashPassword(newPassword);
  await db.$transaction([
    db.user.update({
      where: { id: valid.userId },
      data: { passwordHash, passwordChangedAt: new Date(), mustChangePassword: false, failedLogins: 0, lockedUntil: null },
    }),
    db.passwordResetToken.updateMany({ where: { userId: valid.userId }, data: { usedAt: new Date() } }),
    db.session.deleteMany({ where: { userId: valid.userId } }), // tüm oturumlar düşer
  ]);
  await audit({ user: { id: valid.userId, email: valid.email }, action: "password.reset.completed" });
  return { ok: true };
}
