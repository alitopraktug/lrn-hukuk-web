import { defineConfig } from "prisma/config";

// Prisma 7 no longer loads .env on its own. `process.loadEnvFile` is built into
// Node >= 20.12, so no extra dependency (dotenv) is needed. A missing file is fine
// (production environments inject variables directly).
try {
  process.loadEnvFile(".env");
} catch {
  /* no .env file — rely on real environment variables */
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // `prisma generate` (run from postinstall) does not need a live database, so a
    // placeholder keeps installs working on CI machines that have no DATABASE_URL yet.
    // Migration / seed commands fail with a clear connection error if it is really unset.
    url: process.env.DATABASE_URL ?? "postgresql://placeholder:placeholder@localhost:5432/placeholder",
  },
});
