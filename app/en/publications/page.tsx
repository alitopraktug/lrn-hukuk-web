import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/layout/page-hero";
import { PublicationCard } from "@/components/publications/publication-card";
import { Pagination } from "@/components/ui/pagination";
import { Container, EmptyState, Section } from "@/components/ui/primitives";
import { countPublicPublications, getPublicationCategories, listPublications } from "@/lib/data/publications";
import { getSiteSettings } from "@/lib/data/site";
import { buildMetadata } from "@/lib/seo";
import { UI } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

type SearchParams = Promise<{ q?: string | string[]; kategori?: string | string[]; sayfa?: string | string[] }>;

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

function parse(sp: Awaited<SearchParams>) {
  const q = (first(sp.q) ?? "").trim().slice(0, 80);
  const kategori = (first(sp.kategori) ?? "").trim().slice(0, 100);
  const sayfa = Math.max(1, Number.parseInt(first(sp.sayfa) ?? "1", 10) || 1);
  return { q, kategori, sayfa };
}

function href(params: { q?: string; kategori?: string; sayfa?: number }) {
  const sp = new URLSearchParams();
  if (params.q) sp.set("q", params.q);
  if (params.kategori) sp.set("kategori", params.kategori);
  if (params.sayfa && params.sayfa > 1) sp.set("sayfa", String(params.sayfa));
  const qs = sp.toString();
  return qs ? `/en/publications?${qs}` : "/en/publications";
}

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const { q, kategori, sayfa } = parse(await searchParams);
  const s = await getSiteSettings();
  return buildMetadata(
    {
      title: sayfa > 1 ? `Publications – Page ${sayfa}` : "Publications",
      description: `Articles prepared by ${s.firmName} on legal developments and general information.`,
      path: href({ kategori, sayfa }),
      noindex: Boolean(q),
      locale: "en",
      alternatePath: "/yayinlar",
    },
    s,
  );
}

/** Yayın içeriği her zaman Türkçedir; bu sayfa yalnızca çerçeveyi (arama, filtre, sayfalama) İngilizceye çevirir. */
export default async function EnglishPublicationsPage({ searchParams }: { searchParams: SearchParams }) {
  const { q, kategori, sayfa } = parse(await searchParams);
  const [list, categories, totalAll] = await Promise.all([
    listPublications({ q, category: kategori, page: sayfa }),
    getPublicationCategories(),
    countPublicPublications(),
  ]);

  const showSearch = totalAll >= 4 || Boolean(q);
  const showCategories = categories.length >= 2 || Boolean(kategori);
  const activeCategory = categories.find((c) => c.slug === kategori);

  return (
    <>
      <PageHero
        eyebrow="Publications"
        title="Publications"
        lead="Articles prepared on legal developments for general information."
        locale="en"
        crumbs={[{ name: "Publications", path: "/en/publications" }]}
      >
        <p className="mt-6 max-w-2xl border border-line bg-surface px-4 py-3 text-[0.85rem] text-quiet">{UI.en.trOnlyNotice}</p>
      </PageHero>

      <Section bordered={false} className="!pt-10 sm:!pt-14 lg:!pt-16">
        <Container>
          {showSearch || showCategories ? (
            <div className="mb-12 flex flex-col gap-8 border-b border-line pb-8 lg:mb-14 lg:flex-row lg:items-end lg:justify-between">
              {showCategories ? (
                <nav aria-label="Categories">
                  <ul className="flex flex-wrap gap-2">
                    <li>
                      <CategoryChip href={href({ q })} active={!kategori}>
                        All
                      </CategoryChip>
                    </li>
                    {categories.map((c) => (
                      <li key={c.slug}>
                        <CategoryChip href={href({ q, kategori: c.slug })} active={kategori === c.slug}>
                          {c.name}
                        </CategoryChip>
                      </li>
                    ))}
                  </ul>
                </nav>
              ) : (
                <span />
              )}

              {showSearch ? (
                <form role="search" action="/en/publications" method="get" className="flex w-full max-w-md items-end gap-2">
                  {kategori ? <input type="hidden" name="kategori" value={kategori} /> : null}
                  <div className="flex-1">
                    <label htmlFor="q" className="field-label">
                      Search publications
                    </label>
                    <input id="q" name="q" type="search" defaultValue={q} maxLength={80} autoComplete="off" className="field-input" />
                  </div>
                  <button type="submit" className="btn btn-primary">
                    Search
                  </button>
                </form>
              ) : null}
            </div>
          ) : null}

          {q || kategori ? (
            <p className="mb-8 text-[0.95rem] text-quiet" role="status">
              {q ? (
                <>
                  <strong className="text-foreground">{list.total}</strong> results for “{q}”
                </>
              ) : (
                <>
                  {list.total} publications in <strong className="text-foreground">{activeCategory?.name ?? "category"}</strong>
                </>
              )}
              {" · "}
              <Link href="/en/publications" className="text-wine underline underline-offset-4">
                Clear filter
              </Link>
            </p>
          ) : null}

          {list.items.length ? (
            <ul className="grid gap-x-8 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
              {list.items.map((p) => (
                <li key={p.id}>
                  <PublicationCard pub={p} showCover basePath="/en/publications" locale="en" />
                </li>
              ))}
            </ul>
          ) : q || kategori ? (
            <EmptyState title="No results found.">Try different keywords or clear the filter.</EmptyState>
          ) : (
            <EmptyState title="No publications yet.">Publications will appear here once published.</EmptyState>
          )}

          <Pagination className="mt-16" page={list.page} pageCount={list.pageCount} makeHref={(p) => href({ q, kategori, sayfa: p })} />
        </Container>
      </Section>
    </>
  );
}

function CategoryChip({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "inline-flex min-h-10 items-center border px-4 py-1.5 text-[0.85rem] transition-colors",
        active ? "border-wine bg-wine text-background" : "border-line hover:border-wine hover:text-wine",
      )}
    >
      {children}
    </Link>
  );
}
