import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TeamProfile } from "@/components/team/team-profile";
import { Breadcrumb, JsonLd } from "@/components/ui/seo-blocks";
import { Container } from "@/components/ui/primitives";
import { getSiteSettings } from "@/lib/data/site";
import { getTeamMemberBySlug } from "@/lib/data/team";
import { personLd } from "@/lib/jsonld";
import { buildMetadata } from "@/lib/seo";
import { truncate } from "@/lib/text";
import { localizeTeamMember } from "@/lib/i18n/localize";

export const revalidate = 300;
export const dynamicParams = true;

export async function generateStaticParams() {
  return [];
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [s, memberRaw] = await Promise.all([getSiteSettings(), getTeamMemberBySlug(slug)]);
  if (!memberRaw) return { title: "Profile not found", robots: { index: false, follow: false } };
  const member = localizeTeamMember(memberRaw, "en");
  return buildMetadata(
    {
      title: `${member.fullName} – ${member.title}`,
      seoTitle: member.seoTitle,
      description: member.seoDescription || truncate(member.shortBio || `${member.fullName}, ${member.title} at ${s.firmName}.`, 160),
      path: `/en/team/${member.slug}`,
      image: member.photo,
      type: "profile",
      locale: "en",
      alternatePath: `/ekibimiz/${member.slug}`,
    },
    s,
  );
}

export default async function EnglishTeamMemberPage({ params }: Props) {
  const { slug } = await params;
  const memberRaw = await getTeamMemberBySlug(slug);
  if (!memberRaw) notFound();
  const member = localizeTeamMember(memberRaw, "en");

  return (
    <>
      <Container className="pt-8 sm:pt-10">
        <Breadcrumb
          items={[
            { name: "Our Team", path: "/en/team" },
            { name: member.fullName, path: `/en/team/${member.slug}` },
          ]}
          locale="en"
        />
      </Container>
      <div className="pt-8 lg:pt-12">
        <TeamProfile member={member} locale="en" />
      </div>
      <JsonLd data={personLd(member)} />
    </>
  );
}
