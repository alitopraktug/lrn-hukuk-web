import "server-only";
import { env } from "@/lib/env";

/** Cloudflare Turnstile doğrulaması (isteğe bağlı). Gizli anahtar tanımlı değilse doğrulama atlanır. */
export const isTurnstileEnabled = () => Boolean(env.turnstileSecret && env.turnstileSiteKey);

export async function verifyTurnstile(token: string | undefined, ip: string): Promise<boolean> {
  const secret = env.turnstileSecret;
  if (!secret || !env.turnstileSiteKey) return true;
  if (!token) return false;
  try {
    const body = new URLSearchParams({ secret, response: token });
    if (ip && ip !== "unknown") body.set("remoteip", ip);
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body,
      signal: AbortSignal.timeout(8000),
    });
    const json = (await res.json()) as { success?: boolean };
    return json.success === true;
  } catch (error) {
    console.error("[turnstile] doğrulama hatası:", error instanceof Error ? error.message : error);
    return false;
  }
}
