import "server-only";
import {
  createCipheriv,
  createDecipheriv,
  createHash,
  createHmac,
  hkdfSync,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";
import { env } from "@/lib/env";

export const sha256 = (input: string) => createHash("sha256").update(input).digest("hex");

/** Kriptografik olarak güvenli, URL-güvenli rastgele token. */
export const randomToken = (bytes = 32) => randomBytes(bytes).toString("base64url");

export function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

/** AUTH_SECRET'tan amaca özel anahtar türetir (HKDF) — aynı anahtar farklı amaçlarla yeniden kullanılmaz. */
function deriveKey(purpose: string): Buffer {
  return Buffer.from(hkdfSync("sha256", env.authSecret, "lrn-hukuk/v1", purpose, 32));
}

/** Kişisel veriyi (IP vb.) geri döndürülemez biçimde, anahtarlı olarak özetler. */
export function keyedHash(purpose: string, value: string): string {
  return createHmac("sha256", deriveKey(purpose)).update(value).digest("hex").slice(0, 32);
}

/** AES-256-GCM ile kısa sırların (TOTP) şifreli saklanması. Format: v1.iv.tag.ciphertext (base64url) */
export function encryptSecret(plain: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", deriveKey("totp-secret"), iv);
  const ct = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return ["v1", iv.toString("base64url"), tag.toString("base64url"), ct.toString("base64url")].join(".");
}

export function decryptSecret(token: string): string {
  const [v, iv, tag, ct] = token.split(".");
  if (v !== "v1" || !iv || !tag || !ct) throw new Error("Geçersiz şifreli değer");
  const decipher = createDecipheriv("aes-256-gcm", deriveKey("totp-secret"), Buffer.from(iv, "base64url"));
  decipher.setAuthTag(Buffer.from(tag, "base64url"));
  return Buffer.concat([decipher.update(Buffer.from(ct, "base64url")), decipher.final()]).toString("utf8");
}
