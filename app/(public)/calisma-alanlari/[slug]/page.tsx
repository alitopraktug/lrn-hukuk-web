import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AreaDetailView } from "@/components/practice/area-detail-view";
import { getPracticeAreaBySlug } from "@/lib/data/areas";
import { getSiteSettings } from "@/lib/data/site";
import { buildMetadata } from "@/lib/seo";

export const revalidate = 300;
export const dynamicParams = true;

export async function generateStaticParams() {
  return [];
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [s, area] = await Promise.all([getSiteSettings(), getPracticeAreaBySlug(slug)]);
  if (!area) return { title: "Sayfa bulunamadı", robots: { index: false, follow: false } };
  return buildMetadata(
    {
      title: area.title,
      seoTitle: area.seoTitle,
      description: area.seoDescription || area.shortDescription,
      path: `/calisma-alanlari/${area.slug}`,
      image: area.ogImage ?? area.cover,
    },
    s,
  );
}

export default async function PracticeAreaPage({ params }: Props) {
  const { slug } = await params;
  const [area, settings] = await Promise.all([getPracticeAreaBySlug(slug), getSiteSettings()]);
  if (!area) notFound();
  return <AreaDetailView area={area} disclaimer={settings.publicationDisclaimer} />;
}
