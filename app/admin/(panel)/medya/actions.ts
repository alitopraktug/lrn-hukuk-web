"use server";

import { revalidatePath } from "next/cache";
import { audit } from "@/lib/audit";
import { guard } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { revalidateSite } from "@/lib/admin/helpers";
import { deleteMediaBytes } from "@/lib/media/storage";

const PERM = "media:manage" as const;

export async function updateMediaAlt(formData: FormData): Promise<void> {
  const g = await guard(PERM);
  if (!g.ok) return;
  const id = String(formData.get("id") ?? "");
  const alt = String(formData.get("alt") ?? "").replace(/\s+/g, " ").trim().slice(0, 200);
  await db.media.updateMany({ where: { id }, data: { alt } });
  revalidateSite();
  revalidatePath("/admin/medya");
}

/** Görsel silinir; onu kullanan alanlar (kapak, fotoğraf, logo…) yabancı anahtar kuralıyla boşalır (SetNull). */
export async function deleteMedia(formData: FormData): Promise<void> {
  const g = await guard(PERM);
  if (!g.ok) return;
  const id = String(formData.get("id") ?? "");
  const media = await db.media.findUnique({ where: { id }, select: { filename: true } });
  if (!media) return;
  await db.media.delete({ where: { id } });
  await deleteMediaBytes(id);
  await audit({ user: g.user, action: "media.deleted", entity: "Media", entityId: id, meta: { filename: media.filename } });
  revalidateSite();
  revalidatePath("/admin/medya");
}
