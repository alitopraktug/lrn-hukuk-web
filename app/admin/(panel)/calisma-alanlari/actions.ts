"use server";

import { redirect } from "next/navigation";
import { audit } from "@/lib/audit";
import { errorState, parseForm, successState, type ActionState } from "@/lib/actions";
import { guard } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { existingMediaId, moveInOrder, nextSortOrder, resolveSlug, revalidateSite, syncMediaAlt } from "@/lib/admin/helpers";
import { sanitizeRichText } from "@/lib/richtext";
import { htmlToText } from "@/lib/text";
import { areaSchema } from "@/lib/validation/admin";

const PERM = "area:manage" as const;

export async function saveArea(id: string | null, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const g = await guard(PERM);
  if (!g.ok) return g.state;

  const parsed = parseForm(areaSchema, formData);
  if (!parsed.ok) return parsed.state;
  const d = parsed.data;

  const existing = id ? await db.practiceArea.findFirst({ where: { id, deletedAt: null } }) : null;
  if (id && !existing) return errorState("Çalışma alanı bulunamadı veya silinmiş.");

  const slugResult = await resolveSlug("practiceArea", { slug: d.slug, title: d.title }, id ?? undefined);
  if (!slugResult.ok) return { status: "error", message: "Lütfen işaretli alanları kontrol edin.", fieldErrors: { slug: slugResult.message } };

  const content = sanitizeRichText(d.content);
  let status = existing?.status ?? "DRAFT";
  if (d.intent === "publish") status = "PUBLISHED";
  if (d.intent === "draft" || d.intent === "unpublish") status = "DRAFT";
  if (status === "PUBLISHED" && !d.shortDescription && !htmlToText(content)) {
    return { status: "error", message: "Yayınlamak için en azından kısa açıklama veya içerik girin.", fieldErrors: { shortDescription: "Kısa açıklama veya içerik girin." } };
  }

  const [coverId, ogImageId, teams, pubs] = await Promise.all([
    existingMediaId(d.coverId),
    existingMediaId(d.ogImageId),
    d.teamIds.length ? db.teamMember.findMany({ where: { id: { in: d.teamIds }, deletedAt: null }, select: { id: true } }) : [],
    d.publicationIds.length ? db.publication.findMany({ where: { id: { in: d.publicationIds }, deletedAt: null }, select: { id: true } }) : [],
  ]);

  const data = {
    title: d.title,
    slug: slugResult.slug,
    shortDescription: d.shortDescription,
    content,
    topics: d.topics,
    coverId,
    ogImageId,
    seoTitle: d.seoTitle,
    seoDescription: d.seoDescription,
    status,
    publishedAt: status === "PUBLISHED" ? (existing?.publishedAt ?? new Date()) : (existing?.publishedAt ?? null),
  };

  let savedId: string;
  if (existing) {
    await db.practiceArea.update({
      where: { id: existing.id },
      data: { ...data, teamMembers: { set: teams }, relatedPublications: { set: pubs } },
    });
    savedId = existing.id;
  } else {
    const created = await db.practiceArea.create({
      data: { ...data, sortOrder: await nextSortOrder("practiceArea"), teamMembers: { connect: teams }, relatedPublications: { connect: pubs } },
      select: { id: true },
    });
    savedId = created.id;
  }
  await Promise.all([syncMediaAlt(coverId, d.coverIdAlt), syncMediaAlt(ogImageId, d.ogImageIdAlt)]);
  await audit({ user: g.user, action: existing ? "area.updated" : "area.created", entity: "PracticeArea", entityId: savedId, meta: { title: d.title, status } });
  revalidateSite();

  if (!existing) redirect(`/admin/calisma-alanlari/${savedId}?kaydedildi=1`);
  const was = existing.status;
  return successState(status === "PUBLISHED" ? (was === "PUBLISHED" ? "Çalışma alanı güncellendi." : "Çalışma alanı yayımlandı.") : was === "PUBLISHED" ? "Taslağa alındı; sitede artık görünmüyor." : "Taslak kaydedildi.");
}

export async function toggleAreaStatus(formData: FormData): Promise<void> {
  const g = await guard(PERM);
  if (!g.ok) return;
  const id = String(formData.get("id") ?? "");
  const area = await db.practiceArea.findFirst({ where: { id, deletedAt: null } });
  if (!area) return;
  const publishing = area.status !== "PUBLISHED";
  await db.practiceArea.update({ where: { id }, data: { status: publishing ? "PUBLISHED" : "DRAFT", publishedAt: publishing ? (area.publishedAt ?? new Date()) : area.publishedAt } });
  await audit({ user: g.user, action: "area.updated", entity: "PracticeArea", entityId: id, meta: { title: area.title, status: publishing ? "PUBLISHED" : "DRAFT" } });
  revalidateSite();
}

export async function moveArea(formData: FormData): Promise<void> {
  const g = await guard(PERM);
  if (!g.ok) return;
  const id = String(formData.get("id") ?? "");
  const direction = formData.get("direction") === "up" ? "up" : "down";
  if (await moveInOrder("practiceArea", id, direction)) {
    await audit({ user: g.user, action: "area.reordered", entity: "PracticeArea", entityId: id, meta: { direction } });
    revalidateSite();
  }
}

export async function deleteArea(formData: FormData): Promise<void> {
  const g = await guard(PERM);
  if (!g.ok) return;
  const id = String(formData.get("id") ?? "");
  const area = await db.practiceArea.findFirst({ where: { id, deletedAt: null }, select: { title: true } });
  if (!area) return;
  await db.practiceArea.update({ where: { id }, data: { deletedAt: new Date(), status: "DRAFT" } });
  await audit({ user: g.user, action: "area.deleted", entity: "PracticeArea", entityId: id, meta: { title: area.title } });
  revalidateSite();
}

export async function restoreArea(formData: FormData): Promise<void> {
  const g = await guard(PERM);
  if (!g.ok) return;
  const id = String(formData.get("id") ?? "");
  const area = await db.practiceArea.findFirst({ where: { id, deletedAt: { not: null } }, select: { title: true } });
  if (!area) return;
  await db.practiceArea.update({ where: { id }, data: { deletedAt: null, status: "DRAFT" } });
  await audit({ user: g.user, action: "area.restored", entity: "PracticeArea", entityId: id, meta: { title: area.title } });
  revalidateSite();
}
