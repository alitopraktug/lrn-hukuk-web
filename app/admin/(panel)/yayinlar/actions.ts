"use server";

import { redirect } from "next/navigation";
import type { Prisma } from "@/generated/prisma/client";
import { audit } from "@/lib/audit";
import { errorState, parseForm, successState, type ActionState } from "@/lib/actions";
import { guard } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { existingMediaId, resolveSlug, revalidateSite, syncMediaAlt } from "@/lib/admin/helpers";
import { sanitizeRichText } from "@/lib/richtext";
import { slugify } from "@/lib/slug";
import { htmlToText, normalizeForSearch, readingMinutes } from "@/lib/text";
import { parseTagNames, publicationSchema } from "@/lib/validation/admin";

const PERM = "publication:manage" as const;

/** Yeni yayın oluşturur (id = null) veya mevcut yayını günceller. `intent`: save | draft | publish | unpublish */
export async function savePublication(id: string | null, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const g = await guard(PERM);
  if (!g.ok) return g.state;

  const parsed = parseForm(publicationSchema, formData);
  if (!parsed.ok) return parsed.state;
  const d = parsed.data;

  const existing = id ? await db.publication.findFirst({ where: { id, deletedAt: null } }) : null;
  if (id && !existing) return errorState("Yayın bulunamadı veya silinmiş.");

  const slugResult = await resolveSlug("publication", { slug: d.slug, title: d.title }, id ?? undefined);
  if (!slugResult.ok) return { status: "error", message: "Lütfen işaretli alanları kontrol edin.", fieldErrors: { slug: slugResult.message } };

  const content = sanitizeRichText(d.content);
  const hasContent = htmlToText(content).length > 0;

  // Durum kararı
  let status = existing?.status ?? "DRAFT";
  if (d.intent === "publish") status = "PUBLISHED";
  if (d.intent === "draft" || d.intent === "unpublish") status = "DRAFT";
  if (status === "PUBLISHED" && !hasContent) {
    return { status: "error", message: "Yayınlamak için önce içerik girin.", fieldErrors: { content: "Yayınlamak için içerik girin." } };
  }
  let publishedAt = d.publishedAt ?? existing?.publishedAt ?? null;
  if (status === "PUBLISHED" && !publishedAt) publishedAt = new Date();

  // İlişkili kayıtlar (geçersiz kimlikler yok sayılır)
  const [category, author, coverId, ogImageId, areas] = await Promise.all([
    d.categoryId ? db.category.findUnique({ where: { id: d.categoryId }, select: { id: true, name: true } }) : null,
    d.authorId ? db.teamMember.findFirst({ where: { id: d.authorId, deletedAt: null }, select: { id: true } }) : null,
    existingMediaId(d.coverId),
    existingMediaId(d.ogImageId),
    d.areaIds.length ? db.practiceArea.findMany({ where: { id: { in: d.areaIds }, deletedAt: null }, select: { id: true } }) : [],
  ]);

  const tagNames = parseTagNames(d.tags);
  const tagRecords = await Promise.all(
    tagNames.map((name) => {
      const tagSlug = slugify(name) || "etiket";
      return db.tag.upsert({ where: { slug: tagSlug }, update: {}, create: { name, slug: tagSlug }, select: { id: true } });
    }),
  );

  const data = {
    title: d.title,
    slug: slugResult.slug,
    excerpt: d.excerpt,
    content,
    searchText: normalizeForSearch(`${d.title} ${d.excerpt} ${htmlToText(content)} ${tagNames.join(" ")} ${category?.name ?? ""}`),
    readingMinutes: readingMinutes(content),
    coverId,
    ogImageId,
    categoryId: category?.id ?? null,
    authorId: author?.id ?? null,
    authorName: d.authorName,
    featured: d.featured,
    seoTitle: d.seoTitle,
    seoDescription: d.seoDescription,
    status,
    publishedAt,
  } satisfies Prisma.PublicationUncheckedUpdateInput;

  const relations = {
    tags: { set: tagRecords.map((t) => ({ id: t.id })) },
    relatedAreas: { set: areas.map((a) => ({ id: a.id })) },
  };

  let savedId: string;
  if (existing) {
    await db.publication.update({ where: { id: existing.id }, data: { ...data, ...relations } });
    savedId = existing.id;
  } else {
    const created = await db.publication.create({
      data: { ...data, tags: { connect: relations.tags.set }, relatedAreas: { connect: relations.relatedAreas.set } },
      select: { id: true },
    });
    savedId = created.id;
  }

  await Promise.all([syncMediaAlt(coverId, d.coverIdAlt), syncMediaAlt(ogImageId, d.ogImageIdAlt)]);

  const wasPublished = existing?.status === "PUBLISHED";
  await audit({
    user: g.user,
    action: !existing ? "publication.created" : status === "PUBLISHED" && !wasPublished ? "publication.published" : status === "DRAFT" && wasPublished ? "publication.unpublished" : "publication.updated",
    entity: "Publication",
    entityId: savedId,
    meta: { title: d.title, status },
  });
  if (!existing && status === "PUBLISHED") await audit({ user: g.user, action: "publication.published", entity: "Publication", entityId: savedId, meta: { title: d.title } });
  revalidateSite();

  if (!existing) redirect(`/admin/yayinlar/${savedId}?kaydedildi=1`);
  return successState(
    status === "PUBLISHED" ? (wasPublished ? "Yayın güncellendi ve sitede yayında." : "Yayın yayımlandı.") : wasPublished ? "Yayın taslağa alındı; sitede artık görünmüyor." : "Taslak kaydedildi.",
  );
}

/** Liste satırlarından: yayınla / taslağa al */
export async function togglePublicationStatus(formData: FormData): Promise<void> {
  const g = await guard(PERM);
  if (!g.ok) return;
  const id = String(formData.get("id") ?? "");
  const pub = await db.publication.findFirst({ where: { id, deletedAt: null } });
  if (!pub) return;
  const publishing = pub.status !== "PUBLISHED";
  if (publishing && !htmlToText(pub.content)) return; // içeriksiz yayın yayımlanamaz
  await db.publication.update({
    where: { id },
    data: { status: publishing ? "PUBLISHED" : "DRAFT", publishedAt: publishing ? (pub.publishedAt ?? new Date()) : pub.publishedAt },
  });
  await audit({ user: g.user, action: publishing ? "publication.published" : "publication.unpublished", entity: "Publication", entityId: id, meta: { title: pub.title } });
  revalidateSite();
}

/** Yumuşak silme: kayıt "Silinenler"e taşınır, sitede ve sitemap'te görünmez; geri alınabilir. */
export async function deletePublication(formData: FormData): Promise<void> {
  const g = await guard(PERM);
  if (!g.ok) return;
  const id = String(formData.get("id") ?? "");
  const pub = await db.publication.findFirst({ where: { id, deletedAt: null }, select: { title: true } });
  if (!pub) return;
  await db.publication.update({ where: { id }, data: { deletedAt: new Date(), status: "DRAFT" } });
  await audit({ user: g.user, action: "publication.deleted", entity: "Publication", entityId: id, meta: { title: pub.title } });
  revalidateSite();
}

export async function restorePublication(formData: FormData): Promise<void> {
  const g = await guard(PERM);
  if (!g.ok) return;
  const id = String(formData.get("id") ?? "");
  const pub = await db.publication.findFirst({ where: { id, deletedAt: { not: null } }, select: { title: true } });
  if (!pub) return;
  await db.publication.update({ where: { id }, data: { deletedAt: null, status: "DRAFT" } });
  await audit({ user: g.user, action: "publication.restored", entity: "Publication", entityId: id, meta: { title: pub.title } });
  revalidateSite();
}

export async function purgePublication(formData: FormData): Promise<void> {
  const g = await guard(PERM);
  if (!g.ok) return;
  const id = String(formData.get("id") ?? "");
  const pub = await db.publication.findFirst({ where: { id, deletedAt: { not: null } }, select: { title: true } });
  if (!pub) return; // yalnızca çöp kutusundaki kayıtlar kalıcı silinebilir
  await db.publication.delete({ where: { id } });
  await audit({ user: g.user, action: "publication.purged", entity: "Publication", entityId: id, meta: { title: pub.title } });
  revalidateSite();
}

/** Kategori yönetimi */
export async function saveCategory(formData: FormData): Promise<void> {
  const g = await guard(PERM);
  if (!g.ok) return;
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").replace(/\s+/g, " ").trim().slice(0, 80);
  if (!name) return;
  const areaId = String(formData.get("practiceAreaId") ?? "") || null;
  if (id) {
    await db.category.update({ where: { id }, data: { name, practiceAreaId: areaId } });
  } else {
    let slug = slugify(name) || "kategori";
    for (let i = 2; await db.category.findUnique({ where: { slug } }); i++) slug = `${slugify(name) || "kategori"}-${i}`;
    const last = await db.category.aggregate({ _max: { sortOrder: true } });
    await db.category.create({ data: { name, slug, practiceAreaId: areaId, sortOrder: (last._max.sortOrder ?? 0) + 10 } });
  }
  await audit({ user: g.user, action: "publication.updated", entity: "Category", entityId: id || undefined, meta: { category: name } });
  revalidateSite();
}

export async function deleteCategory(formData: FormData): Promise<void> {
  const g = await guard(PERM);
  if (!g.ok) return;
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await db.category.delete({ where: { id } }).catch(() => {});
  await audit({ user: g.user, action: "publication.updated", entity: "Category", entityId: id, meta: { deleted: true } });
  revalidateSite();
}
