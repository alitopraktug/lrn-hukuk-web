import "server-only";

/**
 * Ortam değişkenlerine tek noktadan, tembel (lazy) erişim.
 * Gizli değerler yalnızca .env / barındırma sağlayıcısının ortam ayarlarından okunur; kaynak kodda sabit değer yoktur.
 * Değerler ilk kullanıldığında okunduğu için `next build` sırasında opsiyonel değişkenlerin eksikliği hata üretmez.
 */

const clean = (v: string | undefined) => {
  const t = v?.trim();
  return t ? t : undefined;
};

export const env = {
  get isProd() {
    return process.env.NODE_ENV === "production";
  },

  /** Kanonik site adresi (sonunda / olmadan). */
  get siteUrl(): string {
    return (clean(process.env.NEXT_PUBLIC_SITE_URL) ?? "http://localhost:3000").replace(/\/+$/, "");
  },

  /** Site https üzerinden yayınlanıyorsa true → Secure çerez, __Host- öneki, HSTS. */
  get secureCookies(): boolean {
    return env.siteUrl.startsWith("https://");
  },

  get authSecret(): string {
    const s = clean(process.env.AUTH_SECRET);
    if (!s || s.length < 32) {
      throw new Error(
        "AUTH_SECRET tanımlı değil veya çok kısa (en az 32 karakter). Örnek üretim: `openssl rand -base64 48`",
      );
    }
    return s;
  },

  get smtp() {
    const host = clean(process.env.SMTP_HOST);
    if (!host) return null;
    const port = Number(clean(process.env.SMTP_PORT) ?? 587);
    return {
      host,
      port,
      secure: port === 465,
      user: clean(process.env.SMTP_USER),
      password: clean(process.env.SMTP_PASSWORD),
    };
  },

  get contactToEmail() {
    return clean(process.env.CONTACT_TO_EMAIL);
  },
  get contactFromEmail() {
    return clean(process.env.CONTACT_FROM_EMAIL) ?? clean(process.env.SMTP_USER);
  },

  get gaId() {
    return clean(process.env.NEXT_PUBLIC_GA_ID);
  },
  get googleSiteVerification() {
    return clean(process.env.GOOGLE_SITE_VERIFICATION);
  },
  get mapEmbedUrl() {
    return clean(process.env.NEXT_PUBLIC_MAP_EMBED_URL);
  },

  get turnstileSiteKey() {
    return clean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);
  },
  get turnstileSecret() {
    return clean(process.env.TURNSTILE_SECRET_KEY);
  },

  get cronSecret() {
    return clean(process.env.CRON_SECRET);
  },
};

export function absoluteUrl(path = "/"): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${env.siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
}
