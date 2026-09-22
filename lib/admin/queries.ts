import "server-only";
import { db } from "@/lib/db";
import type { PickedMedia } from "@/components/admin/image-field";

/** Yönetim formlarının seçenek listeleri ve görsel özetleri. */
export async function getFormOptions() {
  const [categories, authors, areas] = await Promise.all([
    db.category.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }], select: { id: true, name: true } }),
    db.teamMember.findMany({ where: { deletedAt: null }, orderBy: [{ sortOrder: "asc" }], select: { id: true, fullName: true } }),
    db.practiceArea.findMany({ where: { deletedAt: null }, orderBy: [{ sortOrder: "asc" }], select: { id: true, title: true } }),
  ]);
  return { categories, authors, areas };
}

export async function getPickedMedia(id: string | null | undefined): Promise<PickedMedia | null> {
  if (!id) return null;
  const m = await db.media.findUnique({ where: { id }, select: { id: true, alt: true, width: true, height: true, filename: true } });
  return m ?? null;
}

/** Önizleme için: taslak dahil, (silinmemiş) yayını herkese açık görünüme çevirir. */
export async function getPublicationPreview(id: string) {
  const { mapPublicationDetail, publicationDetailInclude } = await import("@/lib/data/publications");
  const p = await db.publication.findFirst({ where: { id, deletedAt: null }, include: publicationDetailInclude });
  return p ? mapPublicationDetail(p) : null;
}
