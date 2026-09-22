import { randomBytes, scrypt as scryptCb, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

/**
 * Parola özetleme: scrypt (Node yerleşik — ek bağımlılık yok).
 * OWASP önerisi olan N=2^16, r=8, p=2 (≈64 MiB) parametreleri kullanılır; parametreler özetin içinde saklandığından
 * ileride artırılabilir ve `needsRehash` ile giriş sırasında yükseltilir.
 */
const scrypt = promisify(scryptCb) as (
  password: string | Buffer,
  salt: Buffer,
  keylen: number,
  options: { N: number; r: number; p: number; maxmem: number },
) => Promise<Buffer>;

const PARAMS = { N: 1 << 16, r: 8, p: 2 } as const;
const KEYLEN = 64;
const MAXMEM = 256 * 1024 * 1024;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await scrypt(password.normalize("NFKC"), salt, KEYLEN, { ...PARAMS, maxmem: MAXMEM });
  return `scrypt$${PARAMS.N}$${PARAMS.r}$${PARAMS.p}$${salt.toString("base64")}$${key.toString("base64")}`;
}

type Parsed = { N: number; r: number; p: number; salt: Buffer; hash: Buffer };

function parse(stored: string): Parsed | null {
  const parts = stored.split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt") return null;
  const [, N, r, p, salt, hash] = parts;
  const parsed = { N: Number(N), r: Number(r), p: Number(p), salt: Buffer.from(salt, "base64"), hash: Buffer.from(hash, "base64") };
  if (![parsed.N, parsed.r, parsed.p].every((n) => Number.isInteger(n) && n > 0)) return null;
  return parsed;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parsed = parse(stored);
  if (!parsed) return false;
  const key = await scrypt(password.normalize("NFKC"), parsed.salt, parsed.hash.length, {
    N: parsed.N,
    r: parsed.r,
    p: parsed.p,
    maxmem: MAXMEM,
  });
  return key.length === parsed.hash.length && timingSafeEqual(key, parsed.hash);
}

export function needsRehash(stored: string): boolean {
  const parsed = parse(stored);
  return !parsed || parsed.N !== PARAMS.N || parsed.r !== PARAMS.r || parsed.p !== PARAMS.p;
}

let dummyHash: Promise<string> | null = null;
/** Kullanıcı bulunamadığında da aynı maliyette doğrulama yapmak için (zamanlama farkıyla kullanıcı tespitini önler). */
export function verifyAgainstDummy(password: string): Promise<boolean> {
  dummyHash ??= hashPassword("dummy-password-for-timing-equalization");
  return dummyHash.then((h) => verifyPassword(password, h));
}

const COMMON = new Set([
  "password1234",
  "123456789012",
  "qwertyuiop12",
  "administrator",
  "admin1234567",
  "iloveyou1234",
  "welcome12345",
  "lrnhukuk1234",
  "hukuk1234567",
  "ankara123456",
]);

/** Parola politikası: uzunluk ağırlıklı (NIST 800-63B); Türkçe hata mesajı döndürür, geçerliyse null. */
export function passwordPolicyError(password: string, context: { email?: string; name?: string } = {}): string | null {
  if (password.length < 12) return "Parola en az 12 karakter olmalıdır.";
  if (password.length > 128) return "Parola en fazla 128 karakter olabilir.";
  if (/^(.)\1+$/.test(password)) return "Parola aynı karakterin tekrarından oluşamaz.";
  const lower = password.toLowerCase();
  if (COMMON.has(lower)) return "Bu parola çok yaygın kullanılıyor; lütfen başka bir parola seçin.";
  const local = context.email?.split("@")[0]?.toLowerCase();
  if (local && local.length >= 4 && lower.includes(local)) return "Parola e-posta adresinizi içermemelidir.";
  const classes = [/[a-zçğıöşü]/, /[A-ZÇĞİÖŞÜ]/, /\d/, /[^A-Za-z0-9çğıöşüÇĞİÖŞÜ]/].filter((re) => re.test(password)).length;
  if (classes < 2) return "Parola en az iki tür karakter (harf, rakam, simge) içermelidir.";
  return null;
}
