import Link from "next/link";
import { PageHero } from "@/components/layout/page-hero";
import { PublicationCard } from "@/components/publications/publication-card";
import { PortraitPlaceholder } from "@/components/team/team-card";
import { MediaImage } from "@/components/ui/media";
import { Arrow, Container, Section } from "@/components/ui/primitives";
import { RichText } from "@/components/ui/seo-blocks";
import { prepareRichText } from "@/lib/richtext";
import { countWords } from "@/lib/text";
import type { AreaDetail } from "@/lib/data/areas";

/**
 * Çalışma alanı detayı (herkese açık sayfa ve yönetim paneli önizlemesi tarafından ortak kullanılır).
 * Okunabilirlik için metin genişliği ~46rem ile sınırlıdır. İçerik yeterince uzunsa (3+ başlık, 600+ kelime)
 * yapışkan bir içindekiler listesi gösterilir.
 */
export function AreaDetailView({ area, disclaimer, crumbs = true }: { area: AreaDetail; disclaimer: string; crumbs?: boolean }) {
  const prepared = prepareRichText(area.content);
  const h2s = prepared.headings.filter((h) => h.level === 2);
  const showToc = h2s.length >= 3 && countWords(prepared.text) > 600;

  return (
    <>
      <PageHero
        eyebrow="Çalışma Alanı"
        title={area.title}
        lead={area.shortDescription}
        crumbs={
          crumbs
            ? [
                { name: "Çalışma Alanlarımız", path: "/calisma-alanlari" },
                { name: area.title, path: `/calisma-alanlari/${area.slug}` },
              ]
            : undefined
        }
      />

      <Section bordered={false} className="!pt-14 sm:!pt-16 lg:!pt-20">
        <Container>
          <div className="grid grid-cols-12 md:gap-x-8 gap-y-12">
            <aside className="col-span-12 lg:col-span-3">
              {showToc ? (
                <nav aria-label="İçindekiler" className="lg:sticky lg:top-[calc(var(--header-h)+28px)]">
                  <p className="eyebrow mb-4">İçindekiler</p>
                  <ol className="space-y-2 border-l border-line text-[0.92rem]">
                    {h2s.map((h) => (
                      <li key={h.id}>
                        <a href={`#${h.id}`} className="-ml-px block border-l border-transparent py-1 pl-4 text-quiet transition-colors hover:border-wine hover:text-foreground">
                          {h.text}
                        </a>
                      </li>
                    ))}
                  </ol>
                </nav>
              ) : null}
            </aside>

            <div className="col-span-12 lg:col-span-9">
              {area.cover ? (
                <div className="relative mb-12 aspect-[16/8] max-w-[52rem] overflow-hidden bg-stone/25">
                  <MediaImage media={area.cover} fill priority sizes="(min-width: 1024px) 800px, 100vw" className="object-cover" />
                </div>
              ) : null}

              {area.topics.length ? (
                <div className="mb-12 max-w-[46rem]">
                  <h2 className="eyebrow mb-4 !font-sans">Başlıca konu başlıkları</h2>
                  <ul className="grid gap-x-8 sm:grid-cols-2">
                    {area.topics.map((t) => (
                      <li key={t} className="flex gap-3 border-t border-line py-3 text-[1.02rem]">
                        <span aria-hidden="true" className="mt-[0.7em] h-px w-4 shrink-0 bg-wine" />
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <RichText prepared={prepared} className="max-w-[46rem]" />

              <p className="mt-14 max-w-[46rem] border-t border-line pt-6 text-[0.88rem] leading-relaxed text-quiet">{disclaimer}</p>
            </div>
          </div>
        </Container>
      </Section>

      {area.team.length ? (
        <Section tone="surface" labelledBy="area-team">
          <Container>
            <div className="grid grid-cols-12 md:gap-x-8 gap-y-8">
              <h2 id="area-team" className="display-md col-span-12 lg:col-span-3">
                Bu alanda çalışan ekip üyeleri
              </h2>
              <ul className="col-span-12 grid gap-x-8 sm:grid-cols-2 lg:col-span-9 xl:grid-cols-3">
                {area.team.map((m) => (
                  <li key={m.id} className="border-t border-foreground/25">
                    <Link href={`/ekibimiz/${m.slug}`} className="group flex items-center gap-4 py-4">
                      <span className="relative block h-20 w-16 shrink-0 overflow-hidden bg-stone/25">
                        {m.photo ? (
                          <MediaImage media={m.photo} fill sizes="64px" className="object-cover" style={{ objectPosition: m.photoPosition }} />
                        ) : (
                          <PortraitPlaceholder />
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-serif text-xl leading-tight group-hover:text-forest">{m.fullName}</span>
                        <span className="eyebrow mt-1 block !text-[0.66rem]">{m.title}</span>
                      </span>
                      <Arrow className="text-forest transition-transform group-hover:translate-x-1" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </Container>
        </Section>
      ) : null}

      {area.publications.length ? (
        <Section labelledBy="area-pubs">
          <Container>
            <h2 id="area-pubs" className="display-md">
              İlgili Yayınlar
            </h2>
            <ul className="mt-10 grid gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
              {area.publications.slice(0, 3).map((p) => (
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
