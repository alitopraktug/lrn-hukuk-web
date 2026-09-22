import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicationArticle } from "@/components/publications/publication-article";
import { JsonLd } from "@/components/ui/seo-blocks";
import { getPublicationBySlug, getRelatedPublications } from "@/lib/data/publications";
import { getSiteSettings } from "@/lib/data/site";
import { articleLd } from "@/lib/jsonld";
import { buildMetadata } from "@/lib/seo";
import { htmlToText, truncate } from "@/lib/text";

export const revalidate = 300;
export const dynamicParams = true;

export async function generateStaticParams() {
  return [];
}

type Props = { params: Promise<{ slug: string }> };

/** Yayın içeriği her zaman Türkçedir (bkz. app/en/publications/page.tsx üstündeki not). */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [s, pub] = await Promise.all([getSiteSettings(), getPublicationBySlug(slug)]);
  if (!pub) return { title: "Publication not found", robots: { index: false, follow: false } };
  return buildMetadata(
    {
      title: pub.title,
      seoTitle: pub.seoTitle,
      description: pub.seoDescription || pub.excerpt || truncate(htmlToText(pub.content), 160),
      path: `/en/publications/${pub.slug}`,
      image: pub.ogImage ?? pub.cover,
      type: "article",
      publishedTime: pub.publishedAt,
      modifiedTime: pub.updatedAt,
      authors: [pub.author.name],
      locale: "en",
      alternatePath: `/yayinlar/${pub.slug}`,
    },
    s,
  );
}

export default async function EnglishPublicationPage({ params }: Props) {
  const { slug } = await params;
  const [pub, settings] = await Promise.all([getPublicationBySlug(slug), getSiteSettings()]);
  if (!pub) notFound();
  const related = await getRelatedPublications(pub, 3);

  return (
    <>
      <PublicationArticle pub={pub} disclaimer={settings.publicationDisclaimer} related={related} locale="en" />
      <JsonLd data={articleLd(pub)} />
    </>
  );
}
