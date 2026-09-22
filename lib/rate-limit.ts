import "server-only";
import { db } from "@/lib/db";

/**
 * PostgreSQL tabanlı sabit pencereli hız sınırlayıcı.
 * Redis gerektirmez; birden çok sunucu/sunucusuz örnek aynı sayaçları paylaşır.
 * Anahtarlar `rateKey()` ile özetlenmiş olmalıdır (ham e-posta/IP saklanmaz).
 */
export type RateLimitResult = { ok: boolean; count: number; limit: number; retryAfterSeconds: number };

export async function rateLimit(key: string, limit: number, windowSeconds: number): Promise<RateLimitResult> {
  const rows = await db.$queryRaw<{ count: number; retry: number }[]>`
    INSERT INTO "RateLimit" ("key", "count", "windowStart")
    VALUES (${key}, 1, now())
    ON CONFLICT ("key") DO UPDATE SET
      "count" = CASE WHEN "RateLimit"."windowStart" < now() - make_interval(secs => ${windowSeconds}::double precision)
                     THEN 1 ELSE "RateLimit"."count" + 1 END,
      "windowStart" = CASE WHEN "RateLimit"."windowStart" < now() - make_interval(secs => ${windowSeconds}::double precision)
                     THEN now() ELSE "RateLimit"."windowStart" END
    RETURNING "count",
      GREATEST(0, CEIL(EXTRACT(EPOCH FROM ("RateLimit"."windowStart" + make_interval(secs => ${windowSeconds}::double precision) - now()))))::int AS "retry"
  `;
  const row = rows[0];
  const count = Number(row?.count ?? 1);
  // Fırsatçı temizlik (~%1): eski pencereleri sil.
  if (Math.random() < 0.01) {
    void db.$executeRaw`DELETE FROM "RateLimit" WHERE "windowStart" < now() - interval '2 days'`.catch(() => {});
  }
  return { ok: count <= limit, count, limit, retryAfterSeconds: Number(row?.retry ?? windowSeconds) };
}

/** Başarılı işlem sonrası sayacı sıfırlar (örn. başarılı girişten sonra). */
export async function resetRateLimit(key: string): Promise<void> {
  await db.rateLimit.deleteMany({ where: { key } });
}

export function retryMessage(seconds: number): string {
  const minutes = Math.ceil(seconds / 60);
  return minutes <= 1 ? "Lütfen bir dakika sonra tekrar deneyin." : `Lütfen yaklaşık ${minutes} dakika sonra tekrar deneyin.`;
}
