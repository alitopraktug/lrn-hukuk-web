import sanitizeHtml from "sanitize-html";

// NOT: Bu dosyada kontrol/birleştirici karakterler için \uXXXX yerine \x.. ve Unicode özellik sınıfları (\p{M}, \p{Zl}, \p{Zp})
// kullanılır; böylece kaynak dosyada ham kontrol karakteri bulunmaz.

/** Türkçe karakterleri sadeleştirip küçük harfe çevirir (arama için). */
export function normalizeForSearch(input: string): string {
  return input
    .replace(/[çÇğĞıİöÖşŞüÜ]/g, (ch) => "cCgGiIoOsSuU"["çÇğĞıİöÖşŞüÜ".indexOf(ch)] ?? ch)
    .normalize("NFD")
    .replace(/\p{M}+/gu, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

const ENTITIES: Record<string, string> = {
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&nbsp;": " ",
  "&amp;": "&",
};

/** HTML'den düz metin çıkarır (etiketleri ve varlıkları çözer). */
export function htmlToText(html: string): string {
  const text = sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} });
  return text
    .replace(/&(lt|gt|quot|#39|nbsp|amp);/g, (m) => ENTITIES[m] ?? m)
    .replace(/\s+/g, " ")
    .trim();
}

export function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

/** Ortalama 200 kelime/dk. En az 1 dakika. */
export function readingMinutes(html: string): number {
  return Math.max(1, Math.ceil(countWords(htmlToText(html)) / 200));
}

export function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Kontrol karakterlerini, satır sonlarını ve fazla boşlukları temizler (başlık/konu/isim alanları için). */
export function singleLine(input: string): string {
  return input
    .replace(/[\x00-\x1f\x7f\p{Zl}\p{Zp}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Serbest metin alanları için: kontrol karakterlerini atar ama satır sonlarını korur. */
export function multiLine(input: string): string {
  return input
    .replace(/\r\n?/g, "\n")
    .replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f\p{Zl}\p{Zp}]/gu, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function truncate(input: string, max: number): string {
  if (input.length <= max) return input;
  const cut = input.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[\s.,;:!?-]+$/, "")}…`;
}

/** "a\nb\n\nc" → ["a","b","c"] */
export function splitLines(input: string | null | undefined): string[] {
  return (input ?? "")
    .split(/\r?\n/)
    .map((l) => singleLine(l))
    .filter(Boolean);
}

/** Boş satırlarla ayrılmış paragrafları dizi olarak verir. */
export function splitParagraphs(input: string | null | undefined): string[] {
  return (input ?? "")
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s*\n\s*/g, " ").trim())
    .filter(Boolean);
}
