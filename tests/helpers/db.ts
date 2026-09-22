import { execSync } from "node:child_process";
import { createPrismaClient } from "@/lib/db-client";

/** Test veritabanı bağlantısı; erişilemiyorsa `available` false olur ve entegrasyon testleri atlanır. */
export const testDb = createPrismaClient(process.env.DATABASE_URL, 3);

export async function isDbAvailable(): Promise<boolean> {
  try {
    await testDb.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}

/** Şemayı test veritabanına uygular (migrasyonlar) ve tabloları temizler. */
export async function prepareDb(): Promise<void> {
  execSync("npx prisma migrate deploy", { stdio: "pipe", env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL } });
  await resetDb();
}

export async function resetDb(): Promise<void> {
  await testDb.$executeRawUnsafe(
    `TRUNCATE "AuditLog","RateLimit","ContactMessage","Session","PasswordResetToken","MediaBlob","Media","Publication","Tag","Category","TeamMember","PracticeArea","Page","SiteSetting","User" RESTART IDENTITY CASCADE`,
  );
}
