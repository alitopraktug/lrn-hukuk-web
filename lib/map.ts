/**
 * Harita gömme adresleri için güvenlik doğrulaması. Yönetim panelinden girilen adres yalnızca bilinen sağlayıcıların
 * "embed" uçlarından biriyse kabul edilir (rastgele bir siteyi iframe'e gömmeyi önler). CSP frame-src ile de uyumludur.
 */
export function safeMapEmbedUrl(input: string | null | undefined): string | null {
  const value = (input ?? "").trim();
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return null;
    const host = url.hostname;
    if (host === "www.google.com" && url.pathname.startsWith("/maps/embed")) return url.toString();
    if (host === "maps.google.com" && url.searchParams.get("output") === "embed") return url.toString();
    if (host === "www.openstreetmap.org" && url.pathname === "/export/embed.html") return url.toString();
  } catch {
    /* geçersiz URL */
  }
  return null;
}

/** API anahtarı gerektirmeyen "Haritada aç" bağlantısı. */
export function mapsSearchUrl(address: string): string {
  const query = address.replace(/\s*\n\s*/g, ", ").slice(0, 300);
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}
