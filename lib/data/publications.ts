import "server-only";
import { cache } from "react";
import type { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { normalizeForSearch } from "@/lib/text";
import { mediaRefSelect, type MediaRef, type PublicationCardData } from "@/lib/data/types";
import { publicPublicationWhere, publicationCardSelect } from "@/lib/data/where";

export const PUBLICATIONS_PER_PAGE = 9;

export type PublicationListParams = { q?: string; category?: string; page?: number; pageSize?: number };

export type PublicationList = {
  items: PublicationCardData[];
  total: number;
  page: number;
  pageCount: number;
  pageSize: number;
};

export async function listPublications(params: PublicationListParams = {}): Promise<PublicationList> {
  const pageSize = params.pageSize ?? PUBLICATIONS_PER_PAGE;
  const where: Prisma.PublicationWhereInput = { ...publicPublicationWhere() };

  const q = params.q ? normalizeForSearch(params.q).slice(0, 80) : "";
  if (q) where.searchText = { contains: q };
  if (params.category) where.category = { slug: params.category };

  const total = await db.publication.count({ where });
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(Math.max(1, Math.floor(params.page ?? 1)), pageCount);

  const items = await db.publication.findMany({
    where,
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    skip: (page - 1) * pageSize,
    take: pageSize,
    select: publicationCardSelect,
  });
  return { items, total, page, pageCount, pageSize };
}

/** Ana sayfa: öne çıkarılanlar önce, sonra en yeniler. */
export const getLatestPublications = cache(async (take = 3): Promise<PublicationCardData[]> => {
  return db.publication.findMany({
    where: publicPublicationWhere(),
    orderBy: [{ featured: "desc" }, { publishedAt: "desc" }],
    take,
    select: publicationCardSelect,
  });
});

/** Yalnızca yayınlanmış yayını olan kategoriler (filtre çubuğu için). */
export const getPublicationCategories = cache(async () => {
  const cats = await db.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: {
      name: true,
      slug: true,
      _count: { select: { publications: { where: publicPublicationWhere() } } },
    },
  });
  return cats.filter((c) => c._count.publications > 0).map((c) => ({ name: c.name, slug: c.slug, count: c._count.publications }));
});

export type PublicationDetail = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  publishedAt: Date | null;
  updatedAt: Date;
  readingMinutes: number;
  featured: boolean;
  category: { id: string; name: string; slug: string } | null;
  tags: { name: string; slug: string }[];
  cover: MediaRef | null;
  ogImage: MediaRef | null;
  seoTitle: string | null;
  seoDescription: string | null;
  author: { name: string; slug: string | null };
  areaIds: string[];
};

export const publicationDetailInclude = {
  cover: { select: mediaRefSelect },
  ogImage: { select: mediaRefSelect },
  category: { select: { id: true, name: true, slug: true } },
  tags: { select: { name: true, slug: true }, orderBy: { name: "asc" } },
  author: { select: { fullName: true, slug: true, status: true, deletedAt: true } },
  relatedAreas: { select: { id: true } },
} satisfies Prisma.PublicationInclude;

export type PublicationWithDetail = Prisma.PublicationGetPayload<{ include: typeof publicationDetailInclude }>;

/** Veritabanı kaydını sayfa bileşenlerinin kullandığı görünüme çevirir (herkese açık sayfa ve yönetim önizlemesi ortak kullanır). */
export function mapPublicationDetail(p: PublicationWithDetail): PublicationDetail {
  const authorPublic = p.author && p.author.status === "PUBLISHED" && !p.author.deletedAt;
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    content: p.content,
    publishedAt: p.publishedAt,
    updatedAt: p.updatedAt,
    readingMinutes: p.readingMinutes,
    featured: p.featured,
    category: p.category,
    tags: p.tags,
    cover: p.cover,
    ogImage: p.ogImage,
    seoTitle: p.seoTitle,
    seoDescription: p.seoDescription,
    author: authorPublic
      ? { name: p.author!.fullName, slug: p.author!.slug }
      : { name: p.authorName?.trim() || p.author?.fullName || "LRN Hukuk", slug: null },
    areaIds: p.relatedAreas.map((a) => a.id),
  };
}

export const getPublicationBySlug = cache(async (slug: string): Promise<PublicationDetail | null> => {
  const p = await db.publication.findFirst({
    where: { slug, ...publicPublicationWhere() },
    include: publicationDetailInclude,
  });
  return p ? mapPublicationDetail(p) : null;
});

/** Aynı kategori veya ortak etiketlere sahip diğer yayınlar. */
export async function getRelatedPublications(pub: Pick<PublicationDetail, "id" | "category" | "tags">, take = 3): Promise<PublicationCardData[]> {
  const or: Prisma.PublicationWhereInput[] = [];
  if (pub.category) or.push({ categoryId: pub.category.id });
  if (pub.tags.length) or.push({ tags: { some: { slug: { in: pub.tags.map((t) => t.slug) } } } });

  const related = or.length
    ? await db.publication.findMany({
        where: { ...publicPublicationWhere(), id: { not: pub.id }, OR: or },
        orderBy: { publishedAt: "desc" },
        take,
        select: publicationCardSelect,
      })
    : [];
  if (related.length >= take) return related;

  const fill = await db.publication.findMany({
    where: { ...publicPublicationWhere(), id: { notIn: [pub.id, ...related.map((r) => r.id)] } },
    orderBy: { publishedAt: "desc" },
    take: take - related.length,
    select: publicationCardSelect,
  });
  return [...related, ...fill];
}

/** Yayında olan toplam yayın sayısı (arama/filtre çubuğunun gösterilip gösterilmeyeceğine karar vermek için). */
export const countPublicPublications = cache(async (): Promise<number> => {
  return db.publication.count({ where: publicPublicationWhere() });
});
