import "server-only";
import { db } from "@/lib/db";
import { audit } from "@/lib/audit";
import { rateLimit, resetRateLimit } from "@/lib/rate-limit";
import { rateKey } from "@/lib/request";
import { hashPassword, needsRehash, verifyAgainstDummy, verifyPassword } from "@/lib/auth/password";
import { decryptSecret, sha256 } from "@/lib/auth/crypto";
import { normalizeRecoveryCode, verifyTotp } from "@/lib/auth/totp";

/**
 * Giriş mantığı (cookie/Next'ten bağımsız → test edilebilir).
 * Savunmalar: IP ve e-posta başına hız sınırı, 5 hatalı denemede 15 dk hesap kilidi, kullanıcı yokken de aynı maliyetli
 * doğrulama (zamanlama farkı yok), tek tip hata mesajı (kullanıcı varlığı sızmaz), her deneme denetim kaydında.
 */
const MAX_FAILED_LOGINS = 5;
const LOCK_MS = 15 * 60 * 1000;

export type LoginResult =
  | { ok: true; userId: string; needs2fa: boolean }
  | { ok: false; reason: "invalid" | "rate"; retryAfterSeconds?: number };

export async function attemptLogin(emailRaw: string, password: string, ip: string): Promise<LoginResult> {
  const email = emailRaw.trim().toLowerCase().slice(0, 200);

  const [ipLimit, emailLimit] = await Promise.all([
    rateLimit(rateKey("login-ip", ip), 30, 15 * 60),
    rateLimit(rateKey("login-email", email), 10, 15 * 60),
  ]);
  if (!ipLimit.ok || !emailLimit.ok) {
    await audit({ action: "login.failed", userEmail: email, meta: { reason: "rate-limited" } });
    return { ok: false, reason: "rate", retryAfterSeconds: Math.max(ipLimit.retryAfterSeconds, emailLimit.retryAfterSeconds) };
  }

  const user = await db.user.findUnique({ where: { email } });
  if (!user) {
    await verifyAgainstDummy(password);
    await audit({ action: "login.failed", userEmail: email, meta: { reason: "unknown-user" } });
    return { ok: false, reason: "invalid" };
  }

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    await verifyAgainstDummy(password);
    await audit({ user, action: "login.locked", meta: { reason: "account-locked" } });
    return { ok: false, reason: "invalid" };
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid || !user.active) {
    const failed = user.failedLogins + 1;
    const lock = failed >= MAX_FAILED_LOGINS;
    await db.user.update({
      where: { id: user.id },
      data: { failedLogins: lock ? 0 : failed, lockedUntil: lock ? new Date(Date.now() + LOCK_MS) : null },
    });
    await audit({ user, action: lock ? "login.locked" : "login.failed", meta: { reason: !user.active ? "inactive" : "bad-password", attempts: failed } });
    return { ok: false, reason: "invalid" };
  }

  await db.user.update({
    where: { id: user.id },
    data: {
      failedLogins: 0,
      lockedUntil: null,
      lastLoginAt: new Date(),
      ...(needsRehash(user.passwordHash) ? { passwordHash: await hashPassword(password) } : {}),
    },
  });
  await resetRateLimit(rateKey("login-email", email));
  return { ok: true, userId: user.id, needs2fa: user.totpEnabled };
}

export type SecondFactorResult = { ok: true; usedRecoveryCode: boolean } | { ok: false; reason: "invalid" | "rate"; retryAfterSeconds?: number };

/** TOTP kodu veya tek kullanımlık kurtarma kodu doğrular. */
export async function verifySecondFactor(userId: string, codeRaw: string): Promise<SecondFactorResult> {
  const limit = await rateLimit(rateKey("login-2fa", userId), 10, 15 * 60);
  if (!limit.ok) return { ok: false, reason: "rate", retryAfterSeconds: limit.retryAfterSeconds };

  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user || !user.active || !user.totpEnabled || !user.totpSecret) return { ok: false, reason: "invalid" };

  const secret = decryptSecret(user.totpSecret);
  const totp = verifyTotp(secret, codeRaw, { lastUsedStep: user.totpLastStep });
  if (totp.ok) {
    await db.user.update({ where: { id: user.id }, data: { totpLastStep: totp.step } });
    await resetRateLimit(rateKey("login-2fa", userId));
    return { ok: true, usedRecoveryCode: false };
  }

  const normalized = normalizeRecoveryCode(codeRaw);
  if (normalized.length === 12) {
    const hash = sha256(normalized);
    if (user.recoveryCodes.includes(hash)) {
      await db.user.update({ where: { id: user.id }, data: { recoveryCodes: user.recoveryCodes.filter((h) => h !== hash) } });
      await resetRateLimit(rateKey("login-2fa", userId));
      return { ok: true, usedRecoveryCode: true };
    }
  }
  await audit({ user, action: "login.2fa.failed" });
  return { ok: false, reason: "invalid" };
}
