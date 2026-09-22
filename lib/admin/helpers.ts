import "server-only";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { slugify, uniqueSlug } from "@/lib/slug";

/**
 * Yönetim panelinde içerik değiştiğinde herkese açık sitenin ilgili önbelleğini geçersiz kılar.
 * Site küçük olduğundan (yaklaşık 15 sayfa) kök düzen altındaki her şey topluca yenilenir — yanlışlıkla eski içerik
 * (örn. silinen bir makale, değişen yazar adı) kalmaz. Sayfalar bir sonraki ziyarette yeniden üretilir.
 */
export function revalidateSite(): void {
  revalidatePath("/", "layout");
  revalidatePath("/sitemap.xml");
}

/** Görselin alternatif metnini günceller (görsel seçici `${name}Alt` alanı gönderir). */
export async function syncMediaAlt(mediaId: string | null | undefined, alt: string | undefined): Promise<void> {
  if (!mediaId || alt === undefined) return;
  await db.media.updateMany({ where: { id: mediaId }, data: { alt } });
}

/** Var olmayan medya kimliklerini `null`a çevirir (yabancı anahtar hatasını önler). */
export async function existingMediaId(id: string | null | undefined): Promise<string | null> {
  if (!id) return null;
  const found = await db.media.findUnique({ where: { id }, select: { id: true } });
  return found?.id ?? null;
}

/** Türkiye kalıcı olarak UTC+3'tedir → datetime-local alanı için değer. */
export function toDateTimeInput(date: Date | null | undefined): string {
  if (!date) return "";
  return new Date(date.getTime() + 3 * 60 * 60 * 1000).toISOString().slice(0, 16);
}

export function toDateInput(date: Date | null | undefined): string {
  return date ? date.toISOString().slice(0, 10) : "";
}

type SlugModel = "publication" | "practiceArea" | "teamMember";

/** Slug çakışmalarını (silinmiş kayıtlar dahil) kontrol eder. */
export async function slugTaken(model: SlugModel, slug: string, excludeId?: string): Promise<boolean> {
  const where = { slug, ...(excludeId ? { id: { not: excludeId } } : {}) };
  if (model === "publication") return Boolean(await db.publication.findFirst({ where, select: { id: true } }));
  if (model === "practiceArea") return Boolean(await db.practiceArea.findFirst({ where, select: { id: true } }));
  return Boolean(await db.teamMember.findFirst({ where, select: { id: true } }));
}

/**
 * Slug'ı çözer: kullanıcı elle yazdıysa aynen kullanılır (çakışırsa hata döner); boşsa başlıktan üretilir ve
 * çakışmada "-2", "-3" son eki eklenir.
 */
export async function resolveSlug(
  model: SlugModel,
  input: { slug: string; title: string },
  excludeId?: string,
): Promise<{ ok: true; slug: string } | { ok: false; message: string }> {
  if (input.slug) {
    if (await slugTaken(model, input.slug, excludeId)) return { ok: false, message: "Bu adres başka bir kayıtta kullanılıyor. Lütfen farklı bir adres yazın." };
    return { ok: true, slug: input.slug };
  }
  const base = slugify(input.title) || "icerik";
  return { ok: true, slug: await uniqueSlug(base, (s) => slugTaken(model, s, excludeId)) };
}

/**
 * Sıralama: kaydı bir adım yukarı/aşağı taşır. Silinmemiş kayıtlar arasında komşuyla yer değiştirir ve
 * tüm sıra numaralarını 10'ar aralıkla yeniden yazar.
 */
export async function moveInOrder(model: "practiceArea" | "teamMember", id: string, direction: "up" | "down"): Promise<boolean> {
  const rows: { id: string }[] =
    model === "practiceArea"
      ? await db.practiceArea.findMany({ where: { deletedAt: null }, orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }], select: { id: true } })
      : await db.teamMember.findMany({ where: { deletedAt: null }, orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }], select: { id: true } });
  const index = rows.findIndex((r) => r.id === id);
  const swap = direction === "up" ? index - 1 : index + 1;
  if (index < 0 || swap < 0 || swap >= rows.length) return false;
  [rows[index], rows[swap]] = [rows[swap], rows[index]];
  await db.$transaction(
    rows.map((r, i) =>
      model === "practiceArea"
        ? db.practiceArea.update({ where: { id: r.id }, data: { sortOrder: (i + 1) * 10 } })
        : db.teamMember.update({ where: { id: r.id }, data: { sortOrder: (i + 1) * 10 } }),
    ),
  );
  return true;
}

export async function nextSortOrder(model: "practiceArea" | "teamMember"): Promise<number> {
  const agg =
    model === "practiceArea"
      ? await db.practiceArea.aggregate({ _max: { sortOrder: true } })
      : await db.teamMember.aggregate({ _max: { sortOrder: true } });
  return (agg._max.sortOrder ?? 0) + 10;
}
