import "server-only";
import { cache } from "react";
import { db } from "@/lib/db";
import { mediaRefSelect, type AreaCard, type MediaRef, type PublicationCardData, type TeamCardData } from "@/lib/data/types";
import {
  publicAreaWhere,
  publicPublicationWhere,
  publicTeamWhere,
  publicationCardSelect,
  teamCardSelect,
} from "@/lib/data/where";

export const getPracticeAreas = cache(async (): Promise<AreaCard[]> => {
  return db.practiceArea.findMany({
    where: publicAreaWhere,
    orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
    select: { id: true, slug: true, title: true, shortDescription: true, sortOrder: true },
  });
});

export type AreaDetail = {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  content: string;
  topics: string[];
  cover: MediaRef | null;
  ogImage: MediaRef | null;
  seoTitle: string | null;
  seoDescription: string | null;
  updatedAt: Date;
  team: TeamCardData[];
  publications: PublicationCardData[];
};

export const getPracticeAreaBySlug = cache(async (slug: string): Promise<AreaDetail | null> => {
  const area = await db.practiceArea.findFirst({
    where: { slug, ...publicAreaWhere },
    include: {
      cover: { select: mediaRefSelect },
      ogImage: { select: mediaRefSelect },
      teamMembers: { where: publicTeamWhere, orderBy: [{ sortOrder: "asc" }], select: teamCardSelect },
      relatedPublications: {
        where: publicPublicationWhere(),
        orderBy: { publishedAt: "desc" },
        take: 6,
        select: publicationCardSelect,
      },
      categories: { select: { id: true } },
    },
  });
  if (!area) return null;

  let publications: PublicationCardData[] = area.relatedPublications;
  // El ile ilişkilendirilmiş yayın yoksa, çalışma alanına bağlı kategorilerdeki yayınları göster.
  if (publications.length === 0 && area.categories.length > 0) {
    publications = await db.publication.findMany({
      where: { ...publicPublicationWhere(), categoryId: { in: area.categories.map((c) => c.id) } },
      orderBy: { publishedAt: "desc" },
      take: 6,
      select: publicationCardSelect,
    });
  }

  return {
    id: area.id,
    slug: area.slug,
    title: area.title,
    shortDescription: area.shortDescription,
    content: area.content,
    topics: area.topics,
    cover: area.cover,
    ogImage: area.ogImage,
    seoTitle: area.seoTitle,
    seoDescription: area.seoDescription,
    updatedAt: area.updatedAt,
    team: area.teamMembers,
    publications,
  };
});
