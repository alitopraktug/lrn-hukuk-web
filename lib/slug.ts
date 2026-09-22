/**
 * Slug üretimi: küçük harf, ASCII, URL-güvenli.
 * ş→s, ğ→g, ü→u, ö→o, ç→c, ı→i (ve büyük harf karşılıkları, İ→i) normalize edilir.
 */
const TR_MAP: Record<string, string> = {
  ş: "s",
  Ş: "s",
  ğ: "g",
  Ğ: "g",
  ü: "u",
  Ü: "u",
  ö: "o",
  Ö: "o",
  ç: "c",
  Ç: "c",
  ı: "i",
  İ: "i",
  I: "i",
};

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function slugify(input: string, maxLength = 80): string {
  const mapped = input.replace(/[şŞğĞüÜöÖçÇıİI]/g, (ch) => TR_MAP[ch] ?? ch);
  const slug = mapped
    .normalize("NFD")
    .replace(/\p{M}+/gu, "")
    .toLowerCase()
    .replace(/&/g, " ve ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (slug.length <= maxLength) return slug;
  return slug.slice(0, maxLength).replace(/-+[^-]*$/, "") || slug.slice(0, maxLength).replace(/-+$/, "");
}

export function isValidSlug(slug: string): boolean {
  return SLUG_PATTERN.test(slug) && slug.length <= 100;
}

/**
 * Aynı slug varsa "-2", "-3" … son eki ekleyerek benzersiz bir slug döndürür.
 * `exists` genellikle veritabanında (silinmiş kayıtlar dahil) arama yapar.
 */
export async function uniqueSlug(base: string, exists: (slug: string) => Promise<boolean>): Promise<string> {
  const root = slugify(base) || "icerik";
  if (!(await exists(root))) return root;
  for (let i = 2; i < 500; i++) {
    const candidate = `${root}-${i}`;
    if (!(await exists(candidate))) return candidate;
  }
  return `${root}-${Date.now().toString(36)}`;
}
