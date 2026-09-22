import type { Metadata } from "next";
import { PageHero } from "@/components/layout/page-hero";
import { ButtonLink, Container, Section } from "@/components/ui/primitives";
import { getPage, getSiteSettings } from "@/lib/data/site";
import { buildMetadata } from "@/lib/seo";
import { splitParagraphs } from "@/lib/text";
import { pad2 } from "@/lib/utils";

export const revalidate = 300;

const en = (d: Record<string, string>, key: string) => d[`${key}_en`] || d[key];

export async function generateMetadata(): Promise<Metadata> {
  const [s, page] = await Promise.all([getSiteSettings(), getPage("about")]);
  return buildMetadata(
    { title: "About Us", description: en(page.data, "intro"), path: "/en/about", locale: "en", alternatePath: "/hakkimizda" },
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
          <div className="col-span-12 lg:col-span-5">
            <h2 id={`s-${index}`} className="display-md">
              {title}
            </h2>
          </div>
          <div className="col-span-12 space-y-5 text-[1.05rem] leading-[1.85] text-quiet lg:col-span-4">
            {splitParagraphs(text).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}

export default async function EnglishAboutPage() {
  const page = await getPage("about");
  const d = page.data;
  const principles = [1, 2, 3, 4].map((n) => ({ title: en(d, `principle${n}Title`), text: en(d, `principle${n}Text`) }));

  return (
    <>
      <PageHero title="About Us" eyebrow="LRN Law" lead={en(d, "intro")} locale="en" crumbs={[{ name: "About Us", path: "/en/about" }]} />
      <TextSection index="01" title={en(d, "officeTitle")} text={en(d, "officeText")} />
      <TextSection index="02" title={en(d, "approachTitle")} text={en(d, "approachText")} />
      <TextSection index="03" title={en(d, "workTitle")} text={en(d, "workText")} />

      <Section labelledBy="principles-title" tone="surface">
        <Container>
          <div className="grid grid-cols-12 md:gap-x-8 gap-y-10">
            <div className="col-span-12 flex items-center gap-4 lg:col-span-3 lg:flex-col lg:items-start lg:gap-3">
              <span className="index-num">04</span>
              <span aria-hidden="true" className="h-px w-10 bg-wine/60 lg:w-8" />
            </div>
            <div className="col-span-12 lg:col-span-9">
              <h2 id="principles-title" className="display-md">
                {en(d, "principlesTitle")}
              </h2>
            </div>
          </div>
          <ul className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:mt-16 lg:grid-cols-4">
            {principles.map((p, i) => (
              <li key={i} className="border-t border-foreground/25 pt-5">
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
            <p className="display-md col-span-12 lg:col-span-7">Learn more about our firm and our practice areas.</p>
            <div className="col-span-12 flex flex-col gap-3 sm:flex-row lg:col-span-5 lg:justify-end">
              <ButtonLink href="/en/team" variant="primary" arrow>
                Our Team
              </ButtonLink>
              <ButtonLink href="/en/practice-areas" variant="outline">
                Practice Areas
              </ButtonLink>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
