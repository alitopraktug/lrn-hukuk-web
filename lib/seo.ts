import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/env";
import { truncate } from "@/lib/text";
import { mediaUrl, type MediaRef } from "@/lib/data/types";

/**
 * SEO yardımcıları. Amaç teknik olarak sağlam meta veri üretmektir; "en iyi/ünlü/garantili" gibi
 * reklam niteliğinde başlık ve anahtar kelime üretilmez. Başlık/açıklama yönetim panelindeki SEO alanlarından gelir.
 */
export type SeoSettings = {
  firmName: string;
  defaultTitle: string;
  defaultDescription: string;
  ogImage: MediaRef | null;
};

export type SeoInput = {
  /** Sayfa başlığı ("| LRN Hukuk" son eki otomatik eklenir). */
  title?: string | null;
  /** Yönetim panelinden girilen tam SEO başlığı; varsa olduğu gibi kullanılır. */
  seoTitle?: string | null;
  description?: string | null;
  path: string;
  image?: MediaRef | null;
  type?: "website" | "article" | "profile";
  noindex?: boolean;
  publishedTime?: Date | null;
  modifiedTime?: Date | null;
  authors?: string[];
  /** Ana sayfa gibi başlığın olduğu gibi kullanılacağı durumlar. */
  absoluteTitle?: boolean;
  /** "en" ile OG locale ve hreflang değişir. Varsayılan "tr". */
  locale?: "tr" | "en";
  /** Diğer dildeki karşılığının yolu (varsa) — hreflang için karşılıklı bağlantı üretir. */
  alternatePath?: string;
};

export function buildMetadata(input: SeoInput, site: SeoSettings): Metadata {
  const description = truncate((input.description || site.defaultDescription).replace(/\s+/g, " ").trim(), 170);
  const url = absoluteUrl(input.path);

  const shownTitle = input.seoTitle?.trim() || input.title?.trim() || site.defaultTitle;
  const fullTitle = input.seoTitle?.trim() || input.absoluteTitle || !input.title ? shownTitle : `${shownTitle} | ${site.firmName}`;

  const img = input.image ?? site.ogImage;
  const images = img
    ? [{ url: absoluteUrl(mediaUrl(img.id)), width: img.width ?? undefined, height: img.height ?? undefined, alt: img.alt || fullTitle }]
    : [{ url: absoluteUrl("/brand/og-default.png"), width: 1200, height: 630, alt: site.firmName }];

  const openGraphType = input.type === "article" ? "article" : input.type === "profile" ? "profile" : "website";
  const locale = input.locale ?? "tr";
  const languages = input.alternatePath
    ? locale === "tr"
      ? { "tr-TR": url, "en-US": absoluteUrl(input.alternatePath) }
      : { "en-US": url, "tr-TR": absoluteUrl(input.alternatePath) }
    : undefined;

  return {
    title: input.seoTitle?.trim() || input.absoluteTitle || !input.title ? { absolute: shownTitle } : input.title,
    description,
    alternates: { canonical: url, ...(languages ? { languages } : {}) },
    robots: input.noindex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      type: openGraphType,
      locale: locale === "en" ? "en_US" : "tr_TR",
      siteName: site.firmName,
      title: fullTitle,
      description,
      url,
      images,
      ...(openGraphType === "article"
        ? {
            publishedTime: input.publishedTime?.toISOString(),
            modifiedTime: input.modifiedTime?.toISOString(),
            authors: input.authors,
          }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: images.map((i) => i.url),
    },
  };
}
