import Link from "next/link";
import { ArticleActions } from "@/components/publications/article-actions";
import { PublicationCard } from "@/components/publications/publication-card";
import { Breadcrumb, RichText } from "@/components/ui/seo-blocks";
import { MediaImage } from "@/components/ui/media";
import { Container, Section } from "@/components/ui/primitives";
import { prepareRichText } from "@/lib/richtext";
import { formatDate, isoDate } from "@/lib/utils";
import type { PublicationDetail } from "@/lib/data/publications";
import type { PublicationCardData } from "@/lib/data/types";

const DAY = 24 * 60 * 60 * 1000;

/**
 * Makale sayfası (herkese açık sayfa ve yönetim paneli önizlemesi tarafından ortak kullanılır).
 * H1 yalnızca makale başlığıdır; gövdede H2/H3 kullanılır. Yazdırmada üst/alt bölümler gizlenir (globals.css).
 */
export function PublicationArticle({
  pub,
  disclaimer,
  related = [],
  crumbs = true,
}: {
  pub: PublicationDetail;
  disclaimer: string;
  related?: PublicationCardData[];
  crumbs?: boolean;
}) {
  const prepared = prepareRichText(pub.content);
  const updated = pub.publishedAt && pub.updatedAt.getTime() - pub.publishedAt.getTime() > DAY ? pub.updatedAt : null;

  return (
    <>
      <article>
        <header className="border-b border-line">
          <Container className="pb-12 pt-8 sm:pt-10 lg:pb-20">
            {crumbs ? (
              <Breadcrumb
                items={[
                  { name: "Yayınlar", path: "/yayinlar" },
                  { name: pub.title, path: `/yayinlar/${pub.slug}` },
                ]}
              />
            ) : (
              <div className="h-5" />
            )}
            <div className="mt-10 grid grid-cols-12 md:gap-x-8 sm:mt-14 lg:mt-16">
              <div className="col-span-12 lg:col-span-10 xl:col-span-9">
                {pub.category ? (
                  <p className="eyebrow rise flex items-center gap-4">
                    <span aria-hidden="true" className="h-px w-8 bg-wine/60" />
                    <Link href={`/yayinlar?kategori=${pub.category.slug}`} className="hover:text-wine-dark">
                      {pub.category.name}
                    </Link>
                  </p>
                ) : null}
                <h1 className="display-lg mt-6 max-w-[20em]">{pub.title}</h1>
                {pub.excerpt ? <p className="lead mt-6 max-w-2xl">{pub.excerpt}</p> : null}
              </div>
            </div>
          </Container>
        </header>

        <Container className="pb-16 pt-12 sm:pt-14 lg:pb-24 lg:pt-16">
          <div className="grid grid-cols-12 md:gap-x-8 gap-y-10">
            <aside className="col-span-12 lg:col-span-3">
              <div className="lg:sticky lg:top-[calc(var(--header-h)+28px)]">
              <dl className="grid grid-cols-2 gap-x-6 gap-y-5 text-[0.92rem] lg:grid-cols-1">
                <div>
                  <dt className="eyebrow !text-quiet">Yazar</dt>
                  <dd className="mt-1">
                    {pub.author.slug ? (
                      <Link href={`/ekibimiz/${pub.author.slug}`} className="text-wine underline underline-offset-4 hover:text-wine">
                        {pub.author.name}
                      </Link>
                    ) : (
                      pub.author.name
                    )}
                  </dd>
                </div>
                {pub.publishedAt ? (
                  <div>
                    <dt className="eyebrow !text-quiet">Yayın tarihi</dt>
                    <dd className="mt-1">
                      <time dateTime={isoDate(pub.publishedAt)}>{formatDate(pub.publishedAt)}</time>
                    </dd>
                  </div>
                ) : null}
                {updated ? (
                  <div>
                    <dt className="eyebrow !text-quiet">Güncellenme</dt>
                    <dd className="mt-1">
                      <time dateTime={isoDate(updated)}>{formatDate(updated)}</time>
                    </dd>
                  </div>
                ) : null}
                <div>
                  <dt className="eyebrow !text-quiet">Okuma süresi</dt>
                  <dd className="mt-1">{pub.readingMinutes} dakika</dd>
                </div>
              </dl>
              <div className="mt-6">
                <ArticleActions />
              </div>
              </div>
            </aside>

            <div className="col-span-12 lg:col-span-9">
              {pub.cover ? (
                <div className="relative mb-12 aspect-[16/9] max-w-[52rem] overflow-hidden bg-stone/25">
                  <MediaImage media={pub.cover} fill priority sizes="(min-width: 1024px) 800px, 100vw" className="object-cover" />
                </div>
              ) : null}

              <RichText prepared={prepared} className="max-w-[46rem]" />

              {pub.tags.length ? (
                <ul className="mt-12 flex max-w-[46rem] flex-wrap gap-2" aria-label="Etiketler">
                  {pub.tags.map((t) => (
                    <li key={t.slug} className="border border-line px-3 py-1 text-[0.82rem] text-quiet">
                      {t.name}
                    </li>
                  ))}
                </ul>
              ) : null}

              {disclaimer ? (
                <aside className="mt-12 max-w-[46rem] border-l-2 border-wine/60 bg-surface px-5 py-4 text-[0.9rem] leading-relaxed text-quiet" aria-label="Bilgilendirme notu">
                  {disclaimer}
                </aside>
              ) : null}
            </div>
          </div>
        </Container>
      </article>

      {related.length ? (
        <Section tone="surface" labelledBy="related-title" className="no-print">
          <Container>
            <h2 id="related-title" className="display-md">
              İlgili Yayınlar
            </h2>
            <ul className="mt-10 grid gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <li key={p.id}>
                  <PublicationCard pub={p} />
                </li>
              ))}
            </ul>
          </Container>
        </Section>
      ) : null}
    </>
  );
}
