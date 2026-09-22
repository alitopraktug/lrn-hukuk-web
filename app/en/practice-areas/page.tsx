import type { Metadata } from "next";
import { PageHero } from "@/components/layout/page-hero";
import { PracticeAreaList } from "@/components/practice/practice-area-list";
import { Container, EmptyState, Section } from "@/components/ui/primitives";
import { getPracticeAreas } from "@/lib/data/areas";
import { getSiteSettings } from "@/lib/data/site";
import { buildMetadata } from "@/lib/seo";
import { localizeAreaCards } from "@/lib/i18n/localize";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettings();
  return buildMetadata(
    {
      title: "Practice Areas",
      description: `${s.firmName}'s practice areas: labour and social security, criminal, health, corporate, commercial, family and administrative law.`,
      path: "/en/practice-areas",
      locale: "en",
      alternatePath: "/calisma-alanlari",
    },
    s,
  );
}

export default async function EnglishPracticeAreasPage() {
  const areasRaw = await getPracticeAreas();
  const areas = localizeAreaCards(areasRaw, "en");
  return (
    <>
      <PageHero
        eyebrow="Practice Areas"
        title="Areas of law we work in"
        lead="Below are the areas in which we work on individual and corporate legal matters. See each area's page for more detail."
        locale="en"
        crumbs={[{ name: "Practice Areas", path: "/en/practice-areas" }]}
      />
      <Section bordered={false} className="!pt-10 sm:!pt-14 lg:!pt-16">
        <Container>
          {areas.length ? (
            <PracticeAreaList areas={areas} basePath="/en/practice-areas" locale="en" />
          ) : (
            <EmptyState title="Practice areas will be published soon." />
          )}
        </Container>
      </Section>
    </>
  );
}
