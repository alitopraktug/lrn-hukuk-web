"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { audit } from "@/lib/audit";
import { guard } from "@/lib/auth/guards";
import { db } from "@/lib/db";

const PERM = "message:read" as const;

export async function setMessageRead(formData: FormData): Promise<void> {
  const g = await guard(PERM);
  if (!g.ok) return;
  const id = String(formData.get("id") ?? "");
  const read = formData.get("read") === "1";
  await db.contactMessage.updateMany({ where: { id }, data: { read } });
  revalidatePath("/admin", "layout");
}

export async function markAllRead(): Promise<void> {
  const g = await guard(PERM);
  if (!g.ok) return;
  await db.contactMessage.updateMany({ where: { read: false }, data: { read: true } });
  revalidatePath("/admin", "layout");
}

export async function deleteMessage(formData: FormData): Promise<void> {
  const g = await guard(PERM);
  if (!g.ok) return;
  const id = String(formData.get("id") ?? "");
  await db.contactMessage.deleteMany({ where: { id } });
  await audit({ user: g.user, action: "message.deleted", entity: "ContactMessage", entityId: id });
  revalidatePath("/admin", "layout");
  if (formData.get("redirect") === "1") redirect("/admin/mesajlar");
}

/** Saklama süresi (SiteSetting.messageRetentionDays) dolmuş mesajları siler. */
export async function purgeExpiredMessages(): Promise<void> {
  const g = await guard(PERM);
  if (!g.ok) return;
  const res = await db.contactMessage.deleteMany({ where: { purgeAfter: { lt: new Date() } } });
  await audit({ user: g.user, action: "messages.purged", meta: { count: res.count } });
  revalidatePath("/admin", "layout");
}
