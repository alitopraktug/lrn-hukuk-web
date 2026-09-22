import type { Metadata } from "next";
import { PageHero } from "@/components/layout/page-hero";
import { PracticeAreaList } from "@/components/practice/practice-area-list";
import { Container, EmptyState, Section } from "@/components/ui/primitives";
import { getPracticeAreas } from "@/lib/data/areas";
import { getSiteSettings } from "@/lib/data/site";
import { buildMetadata } from "@/lib/seo";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettings();
  return buildMetadata(
    {
      title: "Çalışma Alanlarımız",
      description: `${s.firmName}'un çalışma alanları: iş ve sosyal güvenlik, ceza, sağlık, şirketler, ticaret, aile ve idare hukuku.`,
      path: "/calisma-alanlari",
    },
    s,
  );
}

export default async function PracticeAreasPage() {
  const areas = await getPracticeAreas();
  return (
    <>
      <PageHero
        eyebrow="Çalışma Alanlarımız"
        title="Çalıştığımız hukuk alanları"
        lead="Bireysel ve kurumsal hukuki süreçlerde çalıştığımız alanlar aşağıdadır. Ayrıntılar için ilgili alanın sayfasını inceleyebilirsiniz."
        crumbs={[{ name: "Çalışma Alanlarımız", path: "/calisma-alanlari" }]}
      />
      <Section bordered={false} className="!pt-10 sm:!pt-14 lg:!pt-16">
        <Container>
          {areas.length ? <PracticeAreaList areas={areas} /> : <EmptyState title="Çalışma alanları yakında yayımlanacaktır." />}
        </Container>
      </Section>
    </>
  );
}
