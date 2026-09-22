#!/usr/bin/env node
/**
 * Yerel geliştirme için gömülü PostgreSQL (Docker veya ayrı kurulum gerektirmez).
 *
 *   npm run db:dev
 *
 * Veriler ./.pgdata klasöründe tutulur (git'e girmez). Ctrl+C ile düzgün kapanır.
 * Üretimde kullanılmaz — üretim için yönetilen PostgreSQL veya docker-compose.yml kullanın.
 */
import EmbeddedPostgres from "embedded-postgres";
import fs from "node:fs";
import path from "node:path";

const dataDir = path.resolve(process.cwd(), ".pgdata");
const port = Number(process.env.DEV_DB_PORT ?? 5432);
const user = "lrn";
const password = "lrn";
const databases = ["lrn_hukuk", "lrn_hukuk_test"];

const pg = new EmbeddedPostgres({
  databaseDir: dataDir,
  user,
  password,
  port,
  persistent: true,
  // Türkçe Windows'ta varsayılan locale adı ASCII dışı karakter içerdiği için initdb hata verir.
  // Arama ve sıralama uygulama tarafında (searchText) yapıldığından "C" locale yeterlidir.
  initdbFlags: ["--locale=C", "--encoding=UTF8"],
  onLog: () => {},
  onError: (e) => console.error("[postgres]", String(e).trim()),
});

const fresh = !fs.existsSync(path.join(dataDir, "PG_VERSION"));
if (fresh) {
  console.log("İlk kurulum: veritabanı kümesi oluşturuluyor…");
  await pg.initialise();
}
await pg.start();

for (const name of databases) {
  try {
    await pg.createDatabase(name);
    console.log(`Veritabanı oluşturuldu: ${name}`);
  } catch {
    /* zaten var */
  }
}

console.log("\nPostgreSQL hazır.");
console.log(`  DATABASE_URL=postgresql://${user}:${password}@localhost:${port}/lrn_hukuk`);
console.log(`  (testler için: .../lrn_hukuk_test)\n`);
console.log("Durdurmak için Ctrl+C.");

let stopping = false;
async function shutdown() {
  if (stopping) return;
  stopping = true;
  console.log("\nPostgreSQL durduruluyor…");
  try {
    await pg.stop();
  } finally {
    process.exit(0);
  }
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
setInterval(() => {}, 1 << 30);
