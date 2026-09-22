/** Genel (istemci de import edebilir) veri tipleri ve yardımcılar. */
export type MediaRef = {
  id: string;
  alt: string;
  width: number | null;
  height: number | null;
  blurDataUrl: string | null;
};

export const mediaRefSelect = {
  id: true,
  alt: true,
  width: true,
  height: true,
  blurDataUrl: true,
} as const;

export const mediaUrl = (id: string) => `/media/${id}`;

export type AreaCard = {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  sortOrder: number;
};

export type TeamCardData = {
  id: string;
  slug: string;
  fullName: string;
  title: string;
  shortBio: string;
  photoPosition: string;
  photo: MediaRef | null;
};

export type PublicationCardData = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: Date | null;
  readingMinutes: number;
  featured: boolean;
  category: { name: string; slug: string } | null;
  authorName: string | null;
  cover: MediaRef | null;
};
