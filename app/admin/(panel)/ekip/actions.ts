"use server";

import { redirect } from "next/navigation";
import { audit } from "@/lib/audit";
import { errorState, parseForm, successState, type ActionState } from "@/lib/actions";
import { guard } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { existingMediaId, moveInOrder, nextSortOrder, resolveSlug, revalidateSite, syncMediaAlt } from "@/lib/admin/helpers";
import { sanitizeRichText } from "@/lib/richtext";
import { TEAM_FIELD_KEYS, teamSchema } from "@/lib/validation/admin";

const PERM = "team:manage" as const;

/**
 * Ekip üyesi kaydeder. "Aktif" = PUBLISHED (sitede ve /ekibimiz/[slug] adresinde görünür), "Pasif" = DRAFT.
 * Yeni bir avukat eklendiğinde kod değişikliği gerekmez: profil sayfası otomatik oluşur, sitemap'e girer.
 */
export async function saveTeamMember(id: string | null, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const g = await guard(PERM);
  if (!g.ok) return g.state;

  const parsed = parseForm(teamSchema, formData);
  if (!parsed.ok) return parsed.state;
  const d = parsed.data;

  const existing = id ? await db.teamMember.findFirst({ where: { id, deletedAt: null } }) : null;
  if (id && !existing) return errorState("Ekip üyesi bulunamadı veya silinmiş.");

  const slugResult = await resolveSlug("teamMember", { slug: d.slug, title: d.fullName }, id ?? undefined);
  if (!slugResult.ok) return { status: "error", message: "Lütfen işaretli alanları kontrol edin.", fieldErrors: { slug: slugResult.message } };

  let status = existing?.status ?? "DRAFT";
  if (d.intent === "publish") status = "PUBLISHED";
  if (d.intent === "draft" || d.intent === "unpublish") status = "DRAFT";

  const [photoId, areas] = await Promise.all([
    existingMediaId(d.photoId),
    d.areaIds.length ? db.practiceArea.findMany({ where: { id: { in: d.areaIds }, deletedAt: null }, select: { id: true } }) : [],
  ]);

  // "Profilde göster" işaretli olmayan bölümler gizlenir.
  const hiddenFields = TEAM_FIELD_KEYS.filter((k) => !d.visible.includes(k));

  const data = {
    fullName: d.fullName,
    title: d.title,
    slug: slugResult.slug,
    shortBio: d.shortBio,
    bio: sanitizeRichText(d.bio),
    education: d.education,
    barAssociation: d.barAssociation,
    tbbNo: d.tbbNo,
    barNo: d.barNo,
    careerStart: d.careerStart,
    languages: d.languages,
    writings: d.writings,
    email: d.email,
    linkedin: d.linkedin,
    photoId,
    photoPosition: d.photoPosition,
    hiddenFields,
    seoTitle: d.seoTitle,
    seoDescription: d.seoDescription,
    status,
    publishedAt: status === "PUBLISHED" ? (existing?.publishedAt ?? new Date()) : (existing?.publishedAt ?? null),
  };

  let savedId: string;
  if (existing) {
    await db.teamMember.update({ where: { id: existing.id }, data: { ...data, practiceAreas: { set: areas } } });
    savedId = existing.id;
  } else {
    const created = await db.teamMember.create({ data: { ...data, sortOrder: await nextSortOrder("teamMember"), practiceAreas: { connect: areas } }, select: { id: true } });
    savedId = created.id;
  }
  await syncMediaAlt(photoId, d.photoIdAlt);
  await audit({ user: g.user, action: existing ? "team.updated" : "team.created", entity: "TeamMember", entityId: savedId, meta: { fullName: d.fullName, status } });
  revalidateSite();

  if (!existing) redirect(`/admin/ekip/${savedId}?kaydedildi=1`);
  return successState(status === "PUBLISHED" ? "Profil kaydedildi ve sitede aktif." : "Profil kaydedildi (pasif — sitede görünmez).");
}

export async function toggleTeamStatus(formData: FormData): Promise<void> {
  const g = await guard(PERM);
  if (!g.ok) return;
  const id = String(formData.get("id") ?? "");
  const m = await db.teamMember.findFirst({ where: { id, deletedAt: null } });
  if (!m) return;
  const activating = m.status !== "PUBLISHED";
  await db.teamMember.update({ where: { id }, data: { status: activating ? "PUBLISHED" : "DRAFT", publishedAt: activating ? (m.publishedAt ?? new Date()) : m.publishedAt } });
  await audit({ user: g.user, action: "team.updated", entity: "TeamMember", entityId: id, meta: { fullName: m.fullName, status: activating ? "PUBLISHED" : "DRAFT" } });
  revalidateSite();
}

export async function moveTeamMember(formData: FormData): Promise<void> {
  const g = await guard(PERM);
  if (!g.ok) return;
  const id = String(formData.get("id") ?? "");
  const direction = formData.get("direction") === "up" ? "up" : "down";
  if (await moveInOrder("teamMember", id, direction)) {
    await audit({ user: g.user, action: "team.reordered", entity: "TeamMember", entityId: id, meta: { direction } });
    revalidateSite();
  }
}

export async function deleteTeamMember(formData: FormData): Promise<void> {
  const g = await guard(PERM);
  if (!g.ok) return;
  const id = String(formData.get("id") ?? "");
  const m = await db.teamMember.findFirst({ where: { id, deletedAt: null }, select: { fullName: true } });
  if (!m) return;
  await db.teamMember.update({ where: { id }, data: { deletedAt: new Date(), status: "DRAFT" } });
  await audit({ user: g.user, action: "team.deleted", entity: "TeamMember", entityId: id, meta: { fullName: m.fullName } });
  revalidateSite();
}

export async function restoreTeamMember(formData: FormData): Promise<void> {
  const g = await guard(PERM);
  if (!g.ok) return;
  const id = String(formData.get("id") ?? "");
  const m = await db.teamMember.findFirst({ where: { id, deletedAt: { not: null } }, select: { fullName: true } });
  if (!m) return;
  await db.teamMember.update({ where: { id }, data: { deletedAt: null, status: "DRAFT" } });
  await audit({ user: g.user, action: "team.restored", entity: "TeamMember", entityId: id, meta: { fullName: m.fullName } });
  revalidateSite();
}
