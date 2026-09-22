import type { PrismaClient } from "@/generated/prisma/client";

/**
 * Bakım görevleri (Next.js'e bağımlı değil → betik, cron rotası ve panelden çağrılabilir):
 *  - saklama süresi dolan iletişim mesajlarını siler (KVKK: veriyi sonsuza dek tutma),
 *  - süresi dolmuş oturumları, parola sıfırlama token'larını ve eski hız sınırı sayaçlarını temizler,
 *  - 2 yıldan eski denetim kayıtlarını siler.
 */
export async function runMaintenance(db: PrismaClient, now = new Date()) {
  const day = 24 * 60 * 60 * 1000;
  const [messages, sessions, resetTokens, rateLimits, auditLogs] = await Promise.all([
    db.contactMessage.deleteMany({ where: { purgeAfter: { lt: now } } }),
    db.session.deleteMany({ where: { OR: [{ expiresAt: { lt: now } }, { absoluteExpiresAt: { lt: now } }] } }),
    db.passwordResetToken.deleteMany({ where: { expiresAt: { lt: new Date(now.getTime() - day) } } }),
    db.rateLimit.deleteMany({ where: { windowStart: { lt: new Date(now.getTime() - 2 * day) } } }),
    db.auditLog.deleteMany({ where: { createdAt: { lt: new Date(now.getTime() - 730 * day) } } }),
  ]);
  return {
    messages: messages.count,
    sessions: sessions.count,
    resetTokens: resetTokens.count,
    rateLimits: rateLimits.count,
    auditLogs: auditLogs.count,
  };
}
