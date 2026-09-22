import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

/**
 * Prisma istemci fabrikası (Next.js'e bağımlı değil → seed, bakım betikleri ve testlerde de kullanılabilir).
 * Uygulama içinde `lib/db.ts` üzerinden tekil (singleton) örnek kullanılır.
 */
export function createPrismaClient(connectionString = process.env.DATABASE_URL, max = Number(process.env.DATABASE_POOL_MAX ?? 8)) {
  if (!connectionString) {
    throw new Error("DATABASE_URL tanımlı değil. .env dosyasını veya barındırma ortam ayarlarını kontrol edin.");
  }
  return new PrismaClient({ adapter: new PrismaPg({ connectionString, max }) });
}

export type { PrismaClient };
