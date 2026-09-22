import "server-only";
import { cache } from "react";
import { db } from "@/lib/db";
import { mediaRefSelect, type AreaCard, type MediaRef, type TeamCardData } from "@/lib/data/types";
import { publicAreaWhere, publicTeamWhere, teamCardSelect } from "@/lib/data/where";

export const getTeamMembers = cache(async (): Promise<TeamCardData[]> => {
  return db.teamMember.findMany({
    where: publicTeamWhere,
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: teamCardSelect,
  });
});

export type TeamDetail = TeamCardData & {
  bio: string;
  education: string[];
  barAssociation: string | null;
  tbbNo: string | null;
  barNo: string | null;
  careerStart: Date | null;
  languages: string[];
  writings: string[];
  email: string | null;
  linkedin: string | null;
  hiddenFields: string[];
  seoTitle: string | null;
  seoDescription: string | null;
  updatedAt: Date;
  practiceAreas: AreaCard[];
  ogImage: MediaRef | null;
};

export const getTeamMemberBySlug = cache(async (slug: string): Promise<TeamDetail | null> => {
  const m = await db.teamMember.findFirst({
    where: { slug, ...publicTeamWhere },
    include: {
      photo: { select: mediaRefSelect },
      practiceAreas: {
        where: publicAreaWhere,
        orderBy: [{ sortOrder: "asc" }],
        select: { id: true, slug: true, title: true, shortDescription: true, sortOrder: true },
      },
    },
  });
  if (!m) return null;
  return {
    id: m.id,
    slug: m.slug,
    fullName: m.fullName,
    title: m.title,
    shortBio: m.shortBio,
    photoPosition: m.photoPosition,
    photo: m.photo,
    bio: m.bio,
    education: m.education,
    barAssociation: m.barAssociation,
    tbbNo: m.tbbNo,
    barNo: m.barNo,
    careerStart: m.careerStart,
    languages: m.languages,
    writings: m.writings,
    email: m.email,
    linkedin: m.linkedin,
    hiddenFields: m.hiddenFields,
    seoTitle: m.seoTitle,
    seoDescription: m.seoDescription,
    updatedAt: m.updatedAt,
    practiceAreas: m.practiceAreas,
    ogImage: m.photo,
  };
});

/** Profilde belirli bir bölüm gösterilecek mi (yönetim panelinden gizlenmemiş olmalı). */
export const isFieldVisible = (member: { hiddenFields: string[] }, key: string) => !member.hiddenFields.includes(key);
