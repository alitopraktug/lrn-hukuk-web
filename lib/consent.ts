/**
 * Çerez onayı (istemci tarafı yardımcılar).
 *  - Onay durumu, süresi 6 ay olan ve "zorunlu/tercih" kategorisinde sayılan `lrn_consent` çerezinde tutulur.
 *  - Analitik (Google Analytics 4) KULLANICI ONAYINDAN ÖNCE yüklenmez; onay geri çekilirse devre dışı bırakılır ve çerezleri silinir.
 */
export const CONSENT_COOKIE = "lrn_consent";
export const CONSENT_MAX_AGE = 60 * 60 * 24 * 180;
export const CONSENT_EVENT = "lrn:consent-changed";
export const OPEN_CONSENT_EVENT = "lrn:open-consent";

export type Consent = { v: 1; analytics: boolean; ts: number };

export const GA_ID_PATTERN = /^G-[A-Z0-9]{4,20}$/;

export function readConsent(): Consent | null {
  if (typeof document === "undefined") return null;
  const raw = document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${CONSENT_COOKIE}=`))
    ?.slice(CONSENT_COOKIE.length + 1);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(raw)) as Consent;
    if (parsed?.v === 1 && typeof parsed.analytics === "boolean") return parsed;
  } catch {
    /* geçersiz çerez → onay yok say */
  }
  return null;
}

export function writeConsent(analytics: boolean): Consent {
  const consent: Consent = { v: 1, analytics, ts: Date.now() };
  const secure = location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${CONSENT_COOKIE}=${encodeURIComponent(JSON.stringify(consent))}; Max-Age=${CONSENT_MAX_AGE}; Path=/; SameSite=Lax${secure}`;
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: consent }));
  return consent;
}

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    [key: `ga-disable-${string}`]: boolean | undefined;
  }
}

export function loadGoogleAnalytics(id: string): void {
  if (!GA_ID_PATTERN.test(id)) return;
  window[`ga-disable-${id}`] = false;
  if (document.getElementById("ga4-script")) return;

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments);
  };
  window.gtag("js", new Date());
  window.gtag("config", id, {
    anonymize_ip: true,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
  });

  const script = document.createElement("script");
  script.id = "ga4-script";
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
  document.head.appendChild(script);
}

export function disableGoogleAnalytics(id: string): void {
  if (GA_ID_PATTERN.test(id)) window[`ga-disable-${id}`] = true;
  const host = location.hostname;
  const domains = [host, `.${host}`, `.${host.split(".").slice(-2).join(".")}`];
  for (const cookie of document.cookie.split("; ")) {
    const name = cookie.split("=")[0];
    if (name === "_ga" || name.startsWith("_ga_") || name === "_gid" || name.startsWith("_gat")) {
      for (const d of domains) document.cookie = `${name}=; Max-Age=0; Path=/; Domain=${d}`;
      document.cookie = `${name}=; Max-Age=0; Path=/`;
    }
  }
}
