/**
 * Bakım görevlerini çalıştırır (süresi dolan mesajlar, oturumlar, eski kayıtlar). Sunucuda günlük cron ile çalıştırılması önerilir:
 *
 *   0 3 * * *  cd /srv/lrn-hukuk && npm run maintenance
 *
 * Vercel'de bunun yerine vercel.json içindeki cron, /api/cron/maintenance rotasını çağırır.
 */
import { createPrismaClient } from "../lib/db-client";
import { runMaintenance } from "../lib/maintenance";

const db = createPrismaClient();
runMaintenance(db)
  .then((r) => console.log("Bakım tamam:", r))
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
