import type { Prisma } from "@/generated/prisma/client";
import { mediaRefSelect } from "@/lib/data/types";

/**
 * Herkese açık içerik koşulları — TEK YERDE tanımlıdır. Taslak veya silinmiş hiçbir kayıt
 * sitede, sitemap'te ya da API'de görünmemelidir; tüm herkese açık sorgular bu sabitleri kullanır.
 */
export const publicAreaWhere = { status: "PUBLISHED", deletedAt: null } satisfies Prisma.PracticeAreaWhereInput;

export const publicTeamWhere = { status: "PUBLISHED", deletedAt: null } satisfies Prisma.TeamMemberWhereInput;

/** Yayın: PUBLISHED, silinmemiş ve yayın tarihi gelmiş (ileri tarihli yayınlar zamanı gelene dek gizli kalır). */
export const publicPublicationWhere = (now: Date = new Date()) =>
  ({
    status: "PUBLISHED",
    deletedAt: null,
    publishedAt: { lte: now },
  }) satisfies Prisma.PublicationWhereInput;

export const teamCardSelect = {
  id: true,
  slug: true,
  fullName: true,
  title: true,
  shortBio: true,
  photoPosition: true,
  photo: { select: mediaRefSelect },
} satisfies Prisma.TeamMemberSelect;

export const publicationCardSelect = {
  id: true,
  slug: true,
  title: true,
  excerpt: true,
  publishedAt: true,
  readingMinutes: true,
  featured: true,
  authorName: true,
  category: { select: { name: true, slug: true } },
  cover: { select: mediaRefSelect },
} satisfies Prisma.PublicationSelect;
