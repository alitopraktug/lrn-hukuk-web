import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicationArticle } from "@/components/publications/publication-article";
import { JsonLd } from "@/components/ui/seo-blocks";
import { getPublicationBySlug, getRelatedPublications } from "@/lib/data/publications";
import { getSiteSettings } from "@/lib/data/site";
import { articleLd } from "@/lib/jsonld";
import { buildMetadata } from "@/lib/seo";
import { htmlToText, truncate } from "@/lib/text";

/**
 * Makale sayfaları ilk istekte üretilip önbelleğe alınır (ISR). Yönetim panelinde kaydet/yayınla/sil sonrasında
 * revalidatePath ile anında yenilenir; en kötü durumda 5 dakika içinde kendiliğinden tazelenir.
 * Taslak (veya silinmiş / yayın tarihi gelmemiş) yayınlar için getPublicationBySlug null döner → 404.
 */
export const revalidate = 300;
export const dynamicParams = true;

export async function generateStaticParams() {
  return [];
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [s, pub] = await Promise.all([getSiteSettings(), getPublicationBySlug(slug)]);
  if (!pub) return { title: "Yayın bulunamadı", robots: { index: false, follow: false } };
  return buildMetadata(
    {
      title: pub.title,
      seoTitle: pub.seoTitle,
      description: pub.seoDescription || pub.excerpt || truncate(htmlToText(pub.content), 160),
      path: `/yayinlar/${pub.slug}`,
      image: pub.ogImage ?? pub.cover,
      type: "article",
      publishedTime: pub.publishedAt,
      modifiedTime: pub.updatedAt,
      authors: [pub.author.name],
    },
    s,
  );
}

export default async function PublicationPage({ params }: Props) {
  const { slug } = await params;
  const [pub, settings] = await Promise.all([getPublicationBySlug(slug), getSiteSettings()]);
  if (!pub) notFound();
  const related = await getRelatedPublications(pub, 3);

  return (
    <>
      <PublicationArticle pub={pub} disclaimer={settings.publicationDisclaimer} related={related} />
      <JsonLd data={articleLd(pub)} />
    </>
  );
}
