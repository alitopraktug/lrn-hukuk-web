import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const isHttpsSite = siteUrl.startsWith("https://");

/**
 * İçerik Güvenlik Politikası (CSP).
 *  - 'unsafe-eval' YOK (yalnızca geliştirme modunda React'in hata ayıklama araçları için eklenir).
 *  - Herkese açık sayfalar statik olarak önbelleğe alındığından istek başına nonce kullanılamaz; bu yüzden
 *    script-src 'unsafe-inline' (Next.js'in satır içi önyükleme betikleri için) gerekir. Buna karşılık her şey
 *    diğer yönlerden kısıtlıdır: object-src 'none', base-uri, form-action, frame-ancestors 'none', dış kaynaklar beyaz liste.
 *  - Google Analytics, Cloudflare Turnstile ve harita çerçeveleri için ilgili adresler kontrollü biçimde izinlidir;
 *    bunlar yalnızca ilgili özellik (ve gerekiyorsa çerez onayı) etkinse yüklenir.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isProd ? "" : " 'unsafe-eval'"} https://www.googletagmanager.com https://challenges.cloudflare.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.google-analytics.com https://*.googletagmanager.com",
  "font-src 'self' data:",
  "connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://challenges.cloudflare.com",
  "frame-src https://www.google.com https://maps.google.com https://www.openstreetmap.org https://challenges.cloudflare.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "manifest-src 'self'",
  "worker-src 'self' blob:",
  ...(isHttpsSite ? ["upgrade-insecure-requests"] : []),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  // HSTS yalnızca https ile yayınlanan sitede (tarayıcılar http üzerinden zaten yok sayar).
  ...(isHttpsSite ? [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }] : []),
];

const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  // Docker için: NEXT_OUTPUT=standalone npm run build
  output: process.env.NEXT_OUTPUT === "standalone" ? "standalone" : undefined,
  serverExternalPackages: ["sharp", "pg", "nodemailer"],
  images: {
    formats: ["image/avif", "image/webp"],
    localPatterns: [{ pathname: "/media/**" }, { pathname: "/brand/**" }],
    deviceSizes: [360, 480, 640, 768, 1024, 1280, 1600, 1920],
    imageSizes: [64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
      ...(allowedOrigins.length ? { allowedOrigins } : {}),
    },
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      {
        source: "/admin/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
          { key: "Cache-Control", value: "no-store, max-age=0" },
        ],
      },
    ];
  },
};

export default nextConfig;
