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

export const revalidate = 300;
export const dynamicParams = true;

// Profiller ilk istekte üretilir ve önbelleğe alınır; yeni avukat eklendiğinde kod değişikliği gerekmez.
export async function generateStaticParams() {
  return [];
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [s, member] = await Promise.all([getSiteSettings(), getTeamMemberBySlug(slug)]);
  if (!member) return { title: "Profil bulunamadı", robots: { index: false, follow: false } };
  return buildMetadata(
    {
      title: `${member.fullName} – ${member.title}`,
      seoTitle: member.seoTitle,
      description: member.seoDescription || truncate(member.shortBio || `${member.fullName}, ${s.firmName} ${member.title}.`, 160),
      path: `/ekibimiz/${member.slug}`,
      image: member.photo,
      type: "profile",
    },
    s,
  );
}

export default async function TeamMemberPage({ params }: Props) {
  const { slug } = await params;
  const member = await getTeamMemberBySlug(slug);
  if (!member) notFound();

  return (
    <>
      <Container className="pt-8 sm:pt-10">
        <Breadcrumb
          items={[
            { name: "Ekibimiz", path: "/ekibimiz" },
            { name: member.fullName, path: `/ekibimiz/${member.slug}` },
          ]}
        />
      </Container>
      <div className="pt-8 lg:pt-12">
        <TeamProfile member={member} />
      </div>
      <JsonLd data={personLd(member)} />
    </>
  );
}
