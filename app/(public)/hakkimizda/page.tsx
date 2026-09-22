import type { Metadata } from "next";
import { PageHero } from "@/components/layout/page-hero";
import { ButtonLink, Container, Section } from "@/components/ui/primitives";
import { getPage, getSiteSettings } from "@/lib/data/site";
import { buildMetadata } from "@/lib/seo";
import { splitParagraphs } from "@/lib/text";
import { pad2 } from "@/lib/utils";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const [s, page] = await Promise.all([getSiteSettings(), getPage("about")]);
  return buildMetadata(
    { title: "Hakkımızda", seoTitle: page.seoTitle, description: page.seoDescription || page.data.intro, path: "/hakkimizda", image: page.ogImage },
    s,
  );
}

function TextSection({ index, title, text }: { index: string; title: string; text: string }) {
  return (
    <Section labelledBy={`s-${index}`} className="!py-16 sm:!py-20 lg:!py-24">
      <Container>
        <div className="grid grid-cols-12 md:gap-x-8 gap-y-8">
          <div className="col-span-12 flex items-center gap-4 lg:col-span-3 lg:flex-col lg:items-start lg:gap-3">
            <span className="index-num">{index}</span>
            <span aria-hidden="true" className="h-px w-10 bg-wine/60 lg:w-8" />
          </div>
          <div className="reveal col-span-12 lg:col-span-5">
            <h2 id={`s-${index}`} className="display-md">
              {title}
            </h2>
          </div>
          <div className="reveal col-span-12 space-y-5 text-[1.05rem] leading-[1.85] text-quiet lg:col-span-4">
            {splitParagraphs(text).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}

export default async function AboutPage() {
  const page = await getPage("about");
  const d = page.data;
  const principles = [1, 2, 3, 4].map((n) => ({ title: d[`principle${n}Title`], text: d[`principle${n}Text`] }));

  return (
    <>
      <PageHero title="Hakkımızda" eyebrow="LRN Hukuk" lead={d.intro} crumbs={[{ name: "Hakkımızda", path: "/hakkimizda" }]} />
      <TextSection index="01" title={d.officeTitle} text={d.officeText} />
      <TextSection index="02" title={d.approachTitle} text={d.approachText} />
      <TextSection index="03" title={d.workTitle} text={d.workText} />

      <Section labelledBy="principles-title" tone="surface">
        <Container>
          <div className="grid grid-cols-12 md:gap-x-8 gap-y-10">
            <div className="col-span-12 flex items-center gap-4 lg:col-span-3 lg:flex-col lg:items-start lg:gap-3">
              <span className="index-num">04</span>
              <span aria-hidden="true" className="h-px w-10 bg-wine/60 lg:w-8" />
            </div>
            <div className="col-span-12 lg:col-span-9">
              <h2 id="principles-title" className="display-md">
                {d.principlesTitle}
              </h2>
            </div>
          </div>
          <ul className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:mt-16 lg:grid-cols-4">
            {principles.map((p, i) => (
              <li key={i} className="reveal border-t border-foreground/25 pt-5">
                <span className="index-num">{pad2(i + 1)}</span>
                <h3 className="mt-4 font-serif text-[1.7rem] leading-tight">{p.title}</h3>
                <p className="mt-3 text-[0.97rem] leading-relaxed text-quiet">{p.text}</p>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      <Section tone="default">
        <Container>
          <div className="grid grid-cols-12 items-center md:gap-x-8 gap-y-8">
            <p className="display-md col-span-12 lg:col-span-7">Büromuz ve çalışma alanlarımız hakkında daha fazla bilgi edinin.</p>
            <div className="col-span-12 flex flex-col gap-3 sm:flex-row lg:col-span-5 lg:justify-end">
              <ButtonLink href="/ekibimiz" variant="primary" arrow>
                Ekibimiz
              </ButtonLink>
              <ButtonLink href="/calisma-alanlari" variant="outline">
                Çalışma Alanlarımız
              </ButtonLink>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
