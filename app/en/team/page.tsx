import type { Metadata } from "next";
import { PageHero } from "@/components/layout/page-hero";
import { TeamGrid } from "@/components/team/team-grid";
import { Container, EmptyState, Section } from "@/components/ui/primitives";
import { getSiteSettings } from "@/lib/data/site";
import { getTeamMembers } from "@/lib/data/team";
import { buildMetadata } from "@/lib/seo";
import { localizeTeamCards } from "@/lib/i18n/localize";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettings();
  return buildMetadata(
    { title: "Our Team", description: `${s.firmName} lawyers, their professional background and practice areas.`, path: "/en/team", locale: "en", alternatePath: "/ekibimiz" },
    s,
  );
}

export default async function EnglishTeamPage() {
  const teamRaw = await getTeamMembers();
  const team = localizeTeamCards(teamRaw, "en");
  return (
    <>
      <PageHero
        eyebrow="Our Team"
        title="The lawyers at our firm"
        lead="You can find our team's professional background and practice areas in the profiles below."
        locale="en"
        crumbs={[{ name: "Our Team", path: "/en/team" }]}
      />
      <Section bordered={false} className="!pt-14 sm:!pt-20 lg:!pt-24">
        <Container>
          {team.length ? (
            <TeamGrid members={team} priorityFirst basePath="/en/team" locale="en" />
          ) : (
            <EmptyState title="Team profiles are being prepared.">Lawyer profiles will appear here once published.</EmptyState>
          )}
        </Container>
      </Section>
    </>
  );
}
