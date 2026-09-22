/** İstemci ve sunucuda güvenle kullanılabilen küçük yardımcılar. */
export function cn(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(" ");
}

const dateFormat = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Istanbul" });
const dateTimeFormat = new Intl.DateTimeFormat("tr-TR", {
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Istanbul",
});
const shortDateFormat = new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Europe/Istanbul" });

export function formatDate(value: Date | string | null | undefined): string {
  if (!value) return "";
  const d = typeof value === "string" ? new Date(value) : value;
  return Number.isNaN(d.getTime()) ? "" : dateFormat.format(d);
}

export function formatDateTime(value: Date | string | null | undefined): string {
  if (!value) return "";
  const d = typeof value === "string" ? new Date(value) : value;
  return Number.isNaN(d.getTime()) ? "" : dateTimeFormat.format(d);
}

export function formatShortDate(value: Date | string | null | undefined): string {
  if (!value) return "";
  const d = typeof value === "string" ? new Date(value) : value;
  return Number.isNaN(d.getTime()) ? "" : shortDateFormat.format(d);
}

/** <time datetime> için ISO tarih (yalnızca gün). */
export function isoDate(value: Date | null | undefined): string | undefined {
  return value ? value.toISOString().slice(0, 10) : undefined;
}

/** 1 → "01", 12 → "12" */
export const pad2 = (n: number) => String(n).padStart(2, "0");

/** Telefon numarasını tel: bağlantısına uygun hâle getirir. */
export const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, "")}`;

/** "*vurgu*" işaretli metni güvenli biçimde parçalara ayırır (HTML enjekte edilmez). */
export function splitEmphasis(input: string): { text: string; em: boolean }[] {
  const parts: { text: string; em: boolean }[] = [];
  const re = /\*([^*]+)\*/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(input))) {
    if (m.index > last) parts.push({ text: input.slice(last, m.index), em: false });
    parts.push({ text: m[1], em: true });
    last = m.index + m[0].length;
  }
  if (last < input.length) parts.push({ text: input.slice(last), em: false });
  return parts;
}

const monthYearFormat = new Intl.DateTimeFormat("tr-TR", { month: "long", year: "numeric", timeZone: "UTC" });

/** "Eylül 2015" — yalnızca ay ve yıl (date-only alanlar UTC olarak saklanır). */
export function formatMonthYear(value: Date | string | null | undefined): string {
  if (!value) return "";
  const d = typeof value === "string" ? new Date(value) : value;
  return Number.isNaN(d.getTime()) ? "" : monthYearFormat.format(d);
}

/** Verilen tarih şu andan sonra mı? (Bileşen gövdesinde Date.now() çağırmamak için ayrı yardımcı.) */
export function isFuture(value: Date | null | undefined): boolean {
  return Boolean(value && value.getTime() > Date.now());
}
