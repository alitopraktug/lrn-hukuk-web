/**
 * Hem sunucu kodunda hem proxy.ts'de kullanılabilen (Next'e bağımlı olmayan) sabitler.
 * Site https ise "__Host-" önekli çerez kullanılır: yalnızca Secure + Path=/ + Domain'siz kabul edilir,
 * alt alan adlarından çerez enjekte edilmesini engeller.
 */
export const ADMIN_LOGIN_PATH = "/admin/login";

export function sessionCookieName(secure: boolean): string {
  return secure ? "__Host-lrn_session" : "lrn_session";
}

export function isSecureSite(siteUrl: string | undefined): boolean {
  return (siteUrl ?? "").startsWith("https://");
}

/** Oturum açmadan erişilebilen /admin yolları. */
export const PUBLIC_ADMIN_PATHS = ["/admin/login", "/admin/sifremi-unuttum", "/admin/sifre-sifirla"];

export function isPublicAdminPath(pathname: string): boolean {
  return PUBLIC_ADMIN_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export const SESSION_IDLE_MS = 8 * 60 * 60 * 1000; // 8 saat hareketsizlik
export const SESSION_ABSOLUTE_MS = 7 * 24 * 60 * 60 * 1000; // en fazla 7 gün
export const SESSION_PENDING_MS = 10 * 60 * 1000; // parola sonrası 2FA için 10 dk
export const SESSION_REFRESH_AFTER_MS = 10 * 60 * 1000;

/** Yalnızca /admin altındaki göreli adreslere yönlendirir (açık yönlendirme / open-redirect koruması). */
export function safeNextPath(next: unknown): string {
  if (typeof next !== "string") return "/admin";
  if (!next.startsWith("/admin") || next.startsWith("//") || next.includes("\\") || next.includes("\r") || next.includes("\n")) return "/admin";
  if (next.startsWith("/admin/login") || next.startsWith("/admin/sifre")) return "/admin";
  return next;
}
