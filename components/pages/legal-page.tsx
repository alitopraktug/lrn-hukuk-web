import type { Metadata } from "next";
import { PageHero } from "@/components/layout/page-hero";
import { Container, Section } from "@/components/ui/primitives";
import { RichText } from "@/components/ui/seo-blocks";
import { PAGE_META, type PageKey } from "@/lib/content/defaults";
import { getPage, getSiteSettings } from "@/lib/data/site";
import { prepareRichText } from "@/lib/richtext";
import { buildMetadata } from "@/lib/seo";
import { formatDate } from "@/lib/utils";

type LegalKey = Extract<PageKey, "kvkk" | "cookies" | "privacy" | "terms">;

/** KVKK, çerez, gizlilik ve kullanım koşulları: içerik yönetim panelinden (Sayfalar) düzenlenir. */
export async function legalMetadata(key: LegalKey): Promise<Metadata> {
  const [s, page] = await Promise.all([getSiteSettings(), getPage(key)]);
  return buildMetadata(
    {
      title: page.title,
      seoTitle: page.seoTitle,
      description: page.seoDescription || `${s.firmName} – ${page.title}.`,
      path: PAGE_META[key].path,
    },
    s,
  );
}

export async function LegalPage({ pageKey }: { pageKey: LegalKey }) {
  const page = await getPage(pageKey);
  const prepared = prepareRichText(page.content);
  return (
    <>
      <PageHero title={page.title} eyebrow="Bilgilendirme" crumbs={[{ name: page.title, path: PAGE_META[pageKey].path }]} />
      <Section bordered={false} className="!pt-12 sm:!pt-16 lg:!pt-20">
        <Container>
          <div className="grid grid-cols-12 md:gap-x-8">
            <div className="col-span-12 lg:col-span-9 lg:col-start-4">
              <RichText prepared={prepared} className="max-w-[46rem]" />
              {page.updatedAt ? <p className="mt-14 max-w-[46rem] border-t border-line pt-5 text-[0.85rem] text-quiet">Son güncelleme: {formatDate(page.updatedAt)}</p> : null}
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
