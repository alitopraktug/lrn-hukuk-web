import "server-only";
import { headers } from "next/headers";
import { env } from "@/lib/env";
import { keyedHash } from "@/lib/auth/crypto";

/**
 * İstemci IP'si. Site bir ters vekil (Vercel, nginx, Cloudflare) arkasında çalışır; vekilin
 * `X-Forwarded-For` başlığını ÜZERİNE YAZDIĞINDAN emin olun (bkz. README → Güvenlik). Aksi halde IP taklit edilebilir.
 */
export async function getClientIp(): Promise<string> {
  try {
    const h = await headers();
    const xff = h.get("x-forwarded-for")?.split(",")[0]?.trim();
    return (xff || h.get("x-real-ip") || "unknown").slice(0, 64);
  } catch {
    return "unknown";
  }
}

export async function getUserAgent(): Promise<string | null> {
  try {
    const h = await headers();
    return h.get("user-agent")?.slice(0, 255) ?? null;
  } catch {
    return null;
  }
}

/** Hız sınırı anahtarlarında ham IP/e-posta saklamamak için anahtarlı özet. */
export const rateKey = (scope: string, value: string) => `${scope}:${keyedHash("ratelimit", value.toLowerCase())}`;

/**
 * Durum değiştiren route handler'lar için Origin/Host doğrulaması (CSRF savunması).
 * Server Action'lar için Next.js aynı kontrolü kendisi yapar; multipart upload gibi route handler'larda bunu biz yaparız.
 */
export function isSameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return false;
  try {
    const o = new URL(origin);
    const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
    const site = new URL(env.siteUrl);
    return o.host === host || o.host === site.host;
  } catch {
    return false;
  }
}
