import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { attemptLogin, verifySecondFactor } from "@/lib/auth/login";
import { completePasswordReset, validateResetToken } from "@/lib/auth/reset";
import { encryptSecret, sha256 } from "@/lib/auth/crypto";
import { generateTotpSecret, totpAt } from "@/lib/auth/totp";
import { processContact } from "@/lib/contact";
import { rateLimit } from "@/lib/rate-limit";
import { runMaintenance } from "@/lib/maintenance";
import { isDbAvailable, prepareDb, resetDb, testDb } from "../helpers/db";

const available = await isDbAvailable();
const PASSWORD = "Test-Parola-2026-Guclu!";

describe.skipIf(!available)("giriş, iki adımlı doğrulama, sıfırlama, hız sınırı", () => {
  let userId = "";

  beforeAll(async () => {
    await prepareDb();
  });
  beforeEach(async () => {
    await testDb.$executeRawUnsafe(`TRUNCATE "AuditLog","RateLimit","Session","PasswordResetToken","User" RESTART IDENTITY CASCADE`);
    userId = (await testDb.user.create({ data: { email: "yonetici@ornek.test", name: "Test", role: "ADMIN", passwordHash: await hashPassword(PASSWORD) } })).id;
  });
  afterAll(async () => {
    await resetDb();
    await testDb.$disconnect();
  });

  it("doğru bilgilerle girişe izin verir; kayıtlı e-posta büyük/küçük harf duyarsızdır", async () => {
    const r = await attemptLogin(" Yonetici@Ornek.Test ", PASSWORD, "10.0.0.1");
    expect(r).toMatchObject({ ok: true, userId, needs2fa: false });
  });

  it("yanlış parola ve bilinmeyen kullanıcı aynı genel hatayı verir; denemeler denetim kaydına yazılır", async () => {
    expect(await attemptLogin("yonetici@ornek.test", "yanlis-parola-1234", "10.0.0.2")).toEqual({ ok: false, reason: "invalid" });
    expect(await attemptLogin("yok@ornek.test", "yanlis-parola-1234", "10.0.0.2")).toEqual({ ok: false, reason: "invalid" });
    const logs = await testDb.auditLog.findMany({ where: { action: "login.failed" } });
    expect(logs.length).toBe(2);
    // parola asla kaydedilmez
    expect(JSON.stringify(logs)).not.toContain("yanlis-parola-1234");
  });

  it("5 hatalı denemeden sonra hesap geçici kilitlenir (doğru parola bile reddedilir)", async () => {
    for (let i = 0; i < 5; i++) await attemptLogin("yonetici@ornek.test", "yanlis-parola-1234", `10.0.1.${i}`);
    const u = await testDb.user.findUniqueOrThrow({ where: { id: userId } });
    expect(u.lockedUntil).toBeTruthy();
    expect(await attemptLogin("yonetici@ornek.test", PASSWORD, "10.0.9.9")).toEqual({ ok: false, reason: "invalid" });
  });

  it("pasif kullanıcı giriş yapamaz", async () => {
    await testDb.user.update({ where: { id: userId }, data: { active: false } });
    expect((await attemptLogin("yonetici@ornek.test", PASSWORD, "10.0.0.3")).ok).toBe(false);
  });

  it("IP başına hız sınırı devreye girer", async () => {
    let last: Awaited<ReturnType<typeof attemptLogin>> | null = null;
    for (let i = 0; i < 32; i++) last = await attemptLogin(`kisi${i}@ornek.test`, "x-yanlis-parola-1", "10.9.9.9");
    expect(last).toMatchObject({ ok: false, reason: "rate" });
  });

  it("2FA: doğru TOTP kodu kabul edilir, aynı kod tekrar kullanılamaz, yanlış kod reddedilir", async () => {
    const secret = generateTotpSecret();
    await testDb.user.update({ where: { id: userId }, data: { totpEnabled: true, totpSecret: encryptSecret(secret) } });
    expect(await attemptLogin("yonetici@ornek.test", PASSWORD, "10.0.0.4")).toMatchObject({ ok: true, needs2fa: true });

    const code = totpAt(secret);
    expect(await verifySecondFactor(userId, code)).toEqual({ ok: true, usedRecoveryCode: false });
    expect(await verifySecondFactor(userId, code)).toMatchObject({ ok: false }); // replay
    expect(await verifySecondFactor(userId, "000000")).toMatchObject({ ok: false, reason: "invalid" });
  });

  it("2FA: kurtarma kodu bir kez çalışır", async () => {
    const secret = generateTotpSecret();
    await testDb.user.update({ where: { id: userId }, data: { totpEnabled: true, totpSecret: encryptSecret(secret), recoveryCodes: [sha256("abcdefghjkmn")] } });
    expect(await verifySecondFactor(userId, "abcd-efgh-jkmn")).toEqual({ ok: true, usedRecoveryCode: true });
    expect(await verifySecondFactor(userId, "abcd-efgh-jkmn")).toMatchObject({ ok: false });
  });

  it("parola sıfırlama: token tek kullanımlık, süresi dolabilir; tüm oturumlar düşer", async () => {
    const token = "test-token-0123456789-abcdefghijklmnopqrstuvwxyz";
    await testDb.passwordResetToken.create({ data: { id: sha256(token), userId, expiresAt: new Date(Date.now() + 60_000) } });
    await testDb.session.create({ data: { id: "s1", userId, expiresAt: new Date(Date.now() + 60_000), absoluteExpiresAt: new Date(Date.now() + 60_000) } });

    expect(await validateResetToken(token)).toMatchObject({ userId });
    expect(await completePasswordReset(token, "kisa")).toMatchObject({ ok: false });
    expect(await completePasswordReset(token, "Yepyeni-Guclu-Parola-77")).toEqual({ ok: true });

    const u = await testDb.user.findUniqueOrThrow({ where: { id: userId } });
    expect(await verifyPassword("Yepyeni-Guclu-Parola-77", u.passwordHash)).toBe(true);
    expect(await testDb.session.count({ where: { userId } })).toBe(0);
    expect(await validateResetToken(token)).toBeNull(); // yeniden kullanılamaz
    expect(await validateResetToken("gecersiz")).toBeNull();

    const expired = "suresi-dolmus-token-0123456789-abcdefghijklmnop";
    await testDb.passwordResetToken.create({ data: { id: sha256(expired), userId, expiresAt: new Date(Date.now() - 1000) } });
    expect(await validateResetToken(expired)).toBeNull();
  });

  it("rateLimit sabit pencerede sayar ve sınırı aşınca reddeder", async () => {
    const results = [];
    for (let i = 0; i < 5; i++) results.push((await rateLimit("test:key", 3, 60)).ok);
    expect(results).toEqual([true, true, true, false, false]);
    expect((await rateLimit("test:other", 3, 60)).ok).toBe(true);
  });
});

describe.skipIf(!available)("iletişim formu (sunucu tarafı)", () => {
  const valid = { name: "Ayşe Yılmaz", email: "ayse@ornek.com", phone: "0312 000 00 00", subject: "Genel bilgi", message: "Merhaba, bilgi almak istiyorum, teşekkürler.", consent: "on" };

  beforeAll(async () => {
    await prepareDb();
  });
  beforeEach(async () => {
    await testDb.$executeRawUnsafe(`TRUNCATE "RateLimit","ContactMessage","SiteSetting" RESTART IDENTITY CASCADE`);
  });
  afterAll(async () => {
    await resetDb();
    await testDb.$disconnect();
  });

  it("geçerli mesajı kaydeder, saklama süresini (purgeAfter) ayarlar ve IP saklamaz", async () => {
    const r = await processContact({ ...valid, startedAt: Date.now() - 10_000 }, { ip: "1.2.3.4" });
    expect(r.status).toBe("success");
    const rows = await testDb.contactMessage.findMany();
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ name: "Ayşe Yılmaz", email: "ayse@ornek.com", read: false });
    expect(rows[0].purgeAfter!.getTime()).toBeGreaterThan(Date.now() + 360 * 86_400_000);
    expect(JSON.stringify(rows[0])).not.toContain("1.2.3.4");
  });

  it("geçersiz alanlarda Türkçe alan hataları döner ve kayıt oluşmaz", async () => {
    const r = await processContact({ ...valid, email: "gecersiz", consent: undefined }, { ip: "1.2.3.5" });
    expect(r.status).toBe("error");
    expect(r.fieldErrors).toMatchObject({ email: expect.stringContaining("e-posta"), consent: expect.any(String) });
    expect(await testDb.contactMessage.count()).toBe(0);
  });

  it("honeypot dolu ise sessizce başarılı görünür ama hiçbir şey kaydedilmez", async () => {
    const r = await processContact({ ...valid, website: "http://spam.example" }, { ip: "1.2.3.6" });
    expect(r.status).toBe("success");
    expect(await testDb.contactMessage.count()).toBe(0);
  });

  it("çok hızlı gönderim (bot) reddedilir", async () => {
    const r = await processContact({ ...valid, startedAt: Date.now() - 500 }, { ip: "1.2.3.7" });
    expect(r.status).toBe("error");
    expect(await testDb.contactMessage.count()).toBe(0);
  });

  it("aynı IP'den saatte 6'dan fazla gönderim engellenir", async () => {
    const results = [];
    for (let i = 0; i < 8; i++) results.push((await processContact({ ...valid, email: `kisi${i}@ornek.com`, startedAt: Date.now() - 10_000 }, { ip: "9.9.9.9" })).status);
    expect(results.filter((s) => s === "success")).toHaveLength(6);
    expect(results.slice(6)).toEqual(["error", "error"]);
  });

  it("aynı e-postadan saatte 3'ten fazla mesaj engellenir", async () => {
    const results = [];
    for (let i = 0; i < 5; i++) results.push((await processContact({ ...valid, startedAt: Date.now() - 10_000 }, { ip: `8.8.8.${i}` })).status);
    expect(results.filter((s) => s === "success")).toHaveLength(3);
  });

  it("mesaj kaydı kapalı ve SMTP yoksa mesaj alınamaz (sessizce kaybolmaz)", async () => {
    await testDb.siteSetting.create({ data: { id: "site", storeContactMessages: false } });
    const r = await processContact({ ...valid, startedAt: Date.now() - 10_000 }, { ip: "7.7.7.7" });
    expect(r.status).toBe("error");
  });

  it("başlık enjeksiyonu: konu ve ad tek satıra indirgenir, HTML kaydedilir ama render edilmez", async () => {
    await processContact({ ...valid, subject: "Merhaba\r\nBcc: kotu@ornek.com", name: "Ali <b>Veli</b>", startedAt: Date.now() - 10_000 }, { ip: "6.6.6.6" });
    const row = await testDb.contactMessage.findFirstOrThrow();
    expect(row.subject).toBe("Merhaba Bcc: kotu@ornek.com");
    expect(row.subject).not.toMatch(/[\r\n]/);
  });

  it("bakım görevi saklama süresi dolan mesajları siler", async () => {
    await testDb.contactMessage.createMany({
      data: [
        { name: "Eski", email: "a@b.co", subject: "eski", message: "eski mesaj içeriği", consentAt: new Date(), purgeAfter: new Date(Date.now() - 1000) },
        { name: "Yeni", email: "a@b.co", subject: "yeni", message: "yeni mesaj içeriği", consentAt: new Date(), purgeAfter: new Date(Date.now() + 86_400_000) },
      ],
    });
    const res = await runMaintenance(testDb);
    expect(res.messages).toBe(1);
    expect((await testDb.contactMessage.findMany()).map((m) => m.name)).toEqual(["Yeni"]);
  });
});
