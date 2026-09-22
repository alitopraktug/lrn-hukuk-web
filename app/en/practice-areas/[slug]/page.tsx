import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AreaDetailView } from "@/components/practice/area-detail-view";
import { getPracticeAreaBySlug } from "@/lib/data/areas";
import { getSiteSettings } from "@/lib/data/site";
import { buildMetadata } from "@/lib/seo";
import { localizeArea } from "@/lib/i18n/localize";

export const revalidate = 300;
export const dynamicParams = true;

export async function generateStaticParams() {
  return [];
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [s, areaRaw] = await Promise.all([getSiteSettings(), getPracticeAreaBySlug(slug)]);
  if (!areaRaw) return { title: "Page not found", robots: { index: false, follow: false } };
  const { translated: _translated, ...area } = localizeArea(areaRaw, "en");
  return buildMetadata(
    {
      title: area.title,
      seoTitle: area.seoTitle,
      description: area.seoDescription || area.shortDescription,
      path: `/en/practice-areas/${area.slug}`,
      image: area.ogImage ?? area.cover,
      locale: "en",
      alternatePath: `/calisma-alanlari/${area.slug}`,
    },
    s,
  );
}

export default async function EnglishPracticeAreaPage({ params }: Props) {
  const { slug } = await params;
  const [areaRaw, settings] = await Promise.all([getPracticeAreaBySlug(slug), getSiteSettings()]);
  if (!areaRaw) notFound();
  const { translated, ...area } = localizeArea(areaRaw, "en");
  return <AreaDetailView area={area} disclaimer={settings.publicationDisclaimer} locale="en" translated={translated} />;
}
