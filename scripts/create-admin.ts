/**
 * İlk (veya yeni) yönetici kullanıcıyı oluşturur. Herkese açık bir kayıt (/register) sayfası YOKTUR;
 * yönetici hesapları yalnızca bu betikle veya panelde "Kullanıcılar" sayfasından (yönetici olarak) açılır.
 *
 *   npm run admin:create -- --email ad@ornek.com --name "Ad Soyad"
 *   npm run admin:create -- --email ad@ornek.com --name "Ad Soyad" --password "…12+ karakter…"
 *   npm run admin:create -- --email ad@ornek.com --reset            (mevcut kullanıcının parolasını yeniler)
 *   Seçenekler: --role ADMIN|EDITOR (varsayılan ADMIN)
 *
 * --password verilmezse güçlü bir parola üretilir, ekrana YALNIZCA BİR KEZ yazılır ve ilk girişte değiştirilmesi istenir.
 * Parola kaynak koda veya depoya yazılmaz.
 */
import { randomInt } from "node:crypto";
import { createPrismaClient } from "../lib/db-client";
import { hashPassword, passwordPolicyError } from "../lib/auth/password";

const db = createPrismaClient();

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : undefined;
}

function generatePassword(): string {
  const alphabet = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789-_!";
  for (;;) {
    const pw = Array.from({ length: 20 }, () => alphabet[randomInt(alphabet.length)]).join("");
    if (/[a-z]/.test(pw) && /[A-Z]/.test(pw) && /\d/.test(pw) && !passwordPolicyError(pw)) return pw;
  }
}

async function main() {
  const email = arg("email")?.trim().toLowerCase();
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    console.error('Kullanım: npm run admin:create -- --email ad@ornek.com --name "Ad Soyad" [--password "…"] [--role ADMIN|EDITOR] [--reset]');
    process.exitCode = 1;
    return;
  }
  const reset = process.argv.includes("--reset");
  const role = (arg("role") ?? "ADMIN").toUpperCase();
  if (role !== "ADMIN" && role !== "EDITOR") {
    console.error("--role ADMIN veya EDITOR olmalıdır.");
    process.exitCode = 1;
    return;
  }

  const supplied = arg("password");
  if (supplied) {
    const problem = passwordPolicyError(supplied, { email });
    if (problem) {
      console.error(problem);
      process.exitCode = 1;
      return;
    }
  }
  const password = supplied ?? generatePassword();
  const passwordHash = await hashPassword(password);
  const existing = await db.user.findUnique({ where: { email } });

  if (existing && !reset) {
    console.error(`Bu e-posta ile bir kullanıcı zaten var. Parolasını yenilemek için --reset ekleyin.`);
    process.exitCode = 1;
    return;
  }

  if (existing) {
    await db.user.update({
      where: { id: existing.id },
      data: { passwordHash, mustChangePassword: !supplied, failedLogins: 0, lockedUntil: null, passwordChangedAt: new Date(), active: true },
    });
    await db.session.deleteMany({ where: { userId: existing.id } });
  } else {
    const name = arg("name")?.trim();
    if (!name) {
      console.error('--name "Ad Soyad" gerekli.');
      process.exitCode = 1;
      return;
    }
    await db.user.create({ data: { email, name, role, passwordHash, mustChangePassword: !supplied } });
  }

  console.log(`\n${existing ? "Parola yenilendi" : "Kullanıcı oluşturuldu"}: ${email} (${existing ? existing.role : role})`);
  if (!supplied) {
    console.log(`\n  Geçici parola: ${password}\n\n  Bu parola bir daha gösterilmeyecek. İlk girişte değiştirmeniz istenecek.\n`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
