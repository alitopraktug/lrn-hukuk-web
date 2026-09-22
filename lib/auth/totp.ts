import { createHmac, randomBytes } from "node:crypto";

/**
 * TOTP (RFC 6238) — HMAC-SHA1, 6 hane, 30 sn. Google Authenticator, Microsoft Authenticator, 1Password vb. ile uyumlu.
 * Ek bağımlılık kullanılmaz; RFC test vektörleriyle birim testleri vardır.
 */
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

export function base32Encode(buf: Buffer): string {
  let bits = 0;
  let value = 0;
  let out = "";
  for (const byte of buf) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      out += ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) out += ALPHABET[(value << (5 - bits)) & 31];
  return out;
}

export function base32Decode(input: string): Buffer {
  const clean = input.replace(/=+$/g, "").replace(/\s+/g, "").toUpperCase();
  let bits = 0;
  let value = 0;
  const out: number[] = [];
  for (const ch of clean) {
    const idx = ALPHABET.indexOf(ch);
    if (idx === -1) throw new Error("Geçersiz base32 karakteri");
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return Buffer.from(out);
}

export function generateTotpSecret(): string {
  return base32Encode(randomBytes(20));
}

export const TOTP_PERIOD = 30;

export function hotp(secret: Buffer, counter: number, digits = 6): string {
  const buf = Buffer.alloc(8);
  buf.writeBigUInt64BE(BigInt(counter));
  const hmac = createHmac("sha1", secret).update(buf).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const code =
    ((hmac[offset] & 0x7f) << 24) | (hmac[offset + 1] << 16) | (hmac[offset + 2] << 8) | hmac[offset + 3];
  return (code % 10 ** digits).toString().padStart(digits, "0");
}

export const totpStep = (timeMs = Date.now()) => Math.floor(timeMs / 1000 / TOTP_PERIOD);

export function totpAt(secretBase32: string, timeMs = Date.now(), digits = 6): string {
  return hotp(base32Decode(secretBase32), totpStep(timeMs), digits);
}

/**
 * Kodu ±`window` adım toleransıyla doğrular. `lastUsedStep` verilirse aynı (veya daha eski) adımdaki kod reddedilir —
 * böylece ele geçirilmiş bir kod yeniden kullanılamaz.
 */
export function verifyTotp(
  secretBase32: string,
  code: string,
  opts: { timeMs?: number; window?: number; lastUsedStep?: number | null } = {},
): { ok: true; step: number } | { ok: false } {
  const normalized = code.replace(/\s+/g, "");
  if (!/^\d{6}$/.test(normalized)) return { ok: false };
  const secret = base32Decode(secretBase32);
  const current = totpStep(opts.timeMs);
  const window = opts.window ?? 1;
  for (let delta = -window; delta <= window; delta++) {
    const step = current + delta;
    if (opts.lastUsedStep != null && step <= opts.lastUsedStep) continue;
    if (hotp(secret, step) === normalized) return { ok: true, step };
  }
  return { ok: false };
}

export function otpauthUri(opts: { secret: string; account: string; issuer: string }): string {
  const label = encodeURIComponent(`${opts.issuer}:${opts.account}`);
  const params = new URLSearchParams({
    secret: opts.secret,
    issuer: opts.issuer,
    algorithm: "SHA1",
    digits: "6",
    period: String(TOTP_PERIOD),
  });
  return `otpauth://totp/${label}?${params.toString()}`;
}

/** Tek kullanımlık kurtarma kodları: "abcd-efgh-jkmn" biçimi (karışabilen karakterler hariç). */
export function generateRecoveryCodes(count = 8): string[] {
  const chars = "abcdefghjkmnpqrstuvwxyz23456789";
  return Array.from({ length: count }, () => {
    const bytes = randomBytes(12);
    const raw = Array.from(bytes, (b) => chars[b % chars.length]).join("");
    return `${raw.slice(0, 4)}-${raw.slice(4, 8)}-${raw.slice(8, 12)}`;
  });
}

export const normalizeRecoveryCode = (code: string) => code.toLowerCase().replace(/[^a-z0-9]/g, "");
