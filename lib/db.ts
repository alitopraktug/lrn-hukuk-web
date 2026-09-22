import "server-only";
import { createPrismaClient, type PrismaClient } from "@/lib/db-client";

/**
 * Uygulama içi Prisma istemcisi (tekil). Geliştirme modunda hot-reload sırasında bağlantı sayısı artmasın diye
 * global'e tutunur. Sunucusuz ortamlarda (Vercel) havuz küçük tutulur; yönetilen PostgreSQL için "pooled" bağlantı adresi önerilir.
 */
const globalForPrisma = globalThis as unknown as { __prisma?: PrismaClient };

export const db: PrismaClient = globalForPrisma.__prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.__prisma = db;
}

export type { PrismaClient };
