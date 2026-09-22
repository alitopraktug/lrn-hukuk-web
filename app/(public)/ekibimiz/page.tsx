import type { Metadata } from "next";
import { PageHero } from "@/components/layout/page-hero";
import { TeamGrid } from "@/components/team/team-grid";
import { Container, EmptyState, Section } from "@/components/ui/primitives";
import { getSiteSettings } from "@/lib/data/site";
import { getTeamMembers } from "@/lib/data/team";
import { buildMetadata } from "@/lib/seo";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettings();
  return buildMetadata(
    { title: "Ekibimiz", description: `${s.firmName} avukatları, mesleki bilgileri ve çalışma alanları.`, path: "/ekibimiz" },
    s,
  );
}

export default async function TeamPage() {
  const team = await getTeamMembers();
  return (
    <>
      <PageHero
        eyebrow="Ekibimiz"
        title="Büromuzun avukatları"
        lead="Ekibimizin mesleki bilgilerine ve çalışma alanlarına aşağıdaki profillerden ulaşabilirsiniz."
        crumbs={[{ name: "Ekibimiz", path: "/ekibimiz" }]}
      />
      <Section bordered={false} className="!pt-14 sm:!pt-20 lg:!pt-24">
        <Container>
          {team.length ? (
            <TeamGrid members={team} priorityFirst />
          ) : (
            <EmptyState title="Ekip profilleri hazırlanmaktadır.">Avukat profilleri yayımlandığında bu sayfada yer alacaktır.</EmptyState>
          )}
        </Container>
      </Section>
    </>
  );
}
