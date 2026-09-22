import type { Metadata } from "next";
import Link from "next/link";
import { BoldHeroI18n } from "@/components/showcase/bold-hero-i18n";
import { AreaVisualCard } from "@/components/showcase/area-visual-card";
import { PublicationCard } from "@/components/publications/publication-card";
import { TeamGrid } from "@/components/team/team-grid";
import { ButtonLink, Container, EmptyState, LinkArrow, Section, SectionHeader } from "@/components/ui/primitives";
import { getPage, getSiteSettings } from "@/lib/data/site";
import { getPracticeAreas } from "@/lib/data/areas";
import { getTeamMembers } from "@/lib/data/team";
import { getLatestPublications } from "@/lib/data/publications";
import { splitParagraphs } from "@/lib/text";
import { pad2, telHref } from "@/lib/utils";

export const revalidate = 300;

// Karşılaştırma amaçlı ikinci tasarım önizlemesi: arama motorlarına kapalı, sitemap'te yok.
export const metadata: Metadata = {
  title: "Tasarım Önizleme B",
  robots: { index: false, follow: false },
};

/**
 * "Tasarım B" — aynı içerik/veri kaynağı (/ ile birebir aynı panel verisi), yalnızca sunumu farklı:
 * çalışma alanları, ilkeler ve süreç adımları kutulu/görsel kartlarla gösterilir (fundainal.av.tr'nin
 * bölüm yoğunluğuna daha yakın), ama AGENTS.md'deki değişmez kurallar (klişe görsel yok, stok fotoğraf
 * yok, sahte metrik yok, agresif CTA yok) aynen geçerlidir. Sade sürüm: "/".
 */
export default async function ShowcasePage() {
  const [page, aboutPage, settings, areas, team, publications] = await Promise.all([
    getPage("home"),
    getPage("about"),
    getSiteSettings(),
    getPracticeAreas(),
    getTeamMembers(),
    getLatestPublications(3),
  ]);
  const d = page.data;
  const a = aboutPage.data;
  const principles = [1, 2, 3, 4].map((i) => ({ title: a[`principle${i}Title`], text: a[`principle${i}Text`] }));
  const processSteps = [1, 2, 3].map((i) => ({ title: d[`process${i}Title`], text: d[`process${i}Text`] }));

  let n = 0;
  const next = () => pad2(++n);
  let t = 0;
  const tone = (): "default" | "surface" => (t++ % 2 === 0 ? "surface" : "default");

  const aboutIndex = next();
  const areasIndex = next();
  const areasTone = tone();
  const principlesIndex = next();
  const principlesTone = tone();
  const teamIndex = team.length > 0 ? next() : null;
  const teamTone = team.length > 0 ? tone() : undefined;
  const processIndex = next();
  const processTone = tone();
  const pubsIndex = next();
  const pubsTone = tone();
  const contactIndex = next();

  return (
    <>
      {/* Yalnızca bu önizlemede görünen karşılaştırma şeridi */}
      <div className="on-dark relative z-10 bg-ink py-2.5 text-center text-[0.8rem] text-background/85">
        Tasarım önizlemesi · B sürümü — aynı içerik, farklı sunum.{" "}
        <Link href="/" className="underline underline-offset-2 hover:text-background">
          Sade sürüme dön (A)
        </Link>
      </div>

      <BoldHeroI18n eyebrow={d.heroEyebrow} title={d.heroTitle} lead={d.heroLead} primaryLabel={d.heroPrimaryCta} secondaryLabel={d.heroSecondaryCta} />

      {/* Sayılarla — gerçek, doğrulanabilir sayımlar (uydurma metrik/başarı oranı değil) */}
      <div className="border-b border-line bg-surface">
        <Container>
          <ul className="grid grid-cols-1 divide-y divide-line sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            <li className="reveal flex items-baseline justify-center gap-3 py-8 sm:flex-col sm:items-start sm:gap-1 sm:px-8">
              <span className="font-serif text-[2.4rem] leading-none text-forest">{pad2(areas.length)}</span>
              <span className="eyebrow">Çalışma Alanı</span>
            </li>
            <li className="reveal flex items-baseline justify-center gap-3 py-8 sm:flex-col sm:items-start sm:gap-1 sm:px-8">
              <span className="font-serif text-[2.4rem] leading-none text-forest">{pad2(team.length)}</span>
              <span className="eyebrow">Avukat</span>
            </li>
            <li className="reveal flex items-baseline justify-center gap-3 py-8 sm:flex-col sm:items-start sm:gap-1 sm:px-8">
              <span className="font-serif text-[1.7rem] leading-none text-forest">Ankara</span>
              <span className="eyebrow">Merkez Ofis</span>
            </li>
          </ul>
        </Container>
      </div>

      {/* Hakkımızda özeti */}
      <Section labelledBy="about-title">
        <Container>
          <div className="grid grid-cols-12 md:gap-x-8 gap-y-10">
            <div className="col-span-12 flex items-center gap-4 lg:col-span-3 lg:flex-col lg:items-start lg:gap-3">
              <span className="index-num">{aboutIndex}</span>
              <span aria-hidden="true" className="h-px w-10 bg-wine/60 lg:w-8" />
              <span className="eyebrow">{d.aboutEyebrow}</span>
            </div>
            <div className="reveal col-span-12 lg:col-span-5">
              <h2 id="about-title" className="display-lg">
                {d.aboutTitle}
              </h2>
            </div>
            <div className="reveal col-span-12 space-y-5 text-[1.02rem] leading-[1.8] text-quiet lg:col-span-4 lg:pt-3">
              {splitParagraphs(d.aboutBody).map((p, i) => (
                <p key={i}>{p}</p>
              ))}
              <div className="pt-3">
                <LinkArrow href="/hakkimizda">{d.aboutLinkLabel}</LinkArrow>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* Çalışma alanları — görsel kartlar */}
      <Section labelledBy="areas-title" tone={areasTone}>
        <Container>
          <div className="reveal">
            <SectionHeader
              index={areasIndex}
              eyebrow="Çalışma Alanlarımız"
              id="areas-title"
              title={d.practiceTitle}
              intro={d.practiceIntro}
              action={<LinkArrow href="/calisma-alanlari">Tümünü gör</LinkArrow>}
            />
          </div>
          <div className="mt-12 lg:mt-16">
            {areas.length ? (
              <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {areas.map((area, i) => (
                  <AreaVisualCard key={area.id} area={area} index={i + 1} />
                ))}
              </ul>
            ) : (
              <EmptyState title="Çalışma alanları yakında yayımlanacaktır." />
            )}
          </div>
        </Container>
      </Section>

      {/* Yaklaşımımız — kutulu kartlar */}
      <Section labelledBy="principles-title" tone={principlesTone}>
        <Container>
          <div className="reveal">
            <SectionHeader index={principlesIndex} eyebrow="Yaklaşımımız" id="principles-title" title={a.principlesTitle} />
          </div>
          <ul className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:mt-16 lg:grid-cols-4">
            {principles.map((p, i) => (
              <li key={i} className="reveal border border-line bg-surface p-7">
                <span className="flex h-9 w-9 items-center justify-center bg-forest font-serif text-[0.95rem] text-background">{pad2(i + 1)}</span>
                <h3 className="mt-5 font-serif text-[1.5rem] leading-tight">{p.title}</h3>
                <p className="mt-3 text-[0.92rem] leading-relaxed text-quiet">{p.text}</p>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      {/* Ekip */}
      {teamIndex ? (
        <Section labelledBy="team-title" tone={teamTone}>
          <Container>
            <div className="reveal">
              <SectionHeader
                index={teamIndex}
                eyebrow="Ekibimiz"
                id="team-title"
                title={d.teamTitle}
                intro={d.teamIntro}
                action={<LinkArrow href="/ekibimiz">Tüm ekip</LinkArrow>}
              />
            </div>
            <TeamGrid members={team} className="mt-12 lg:mt-16" />
          </Container>
        </Section>
      ) : null}

      {/* Çalışma şeklimiz — kutulu adımlar */}
      <Section labelledBy="process-title" tone={processTone}>
        <Container>
          <div className="reveal">
            <SectionHeader index={processIndex} eyebrow="Süreç" id="process-title" title={d.processTitle} intro={d.processIntro} />
          </div>
          <ol className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-3 lg:mt-16">
            {processSteps.map((s, i) => (
              <li key={i} className="reveal border border-line bg-surface p-7">
                <span className="flex h-9 w-9 items-center justify-center bg-wine font-serif text-[0.95rem] text-background">{pad2(i + 1)}</span>
                <h3 className="mt-5 font-serif text-[1.5rem] leading-tight">{s.title}</h3>
                <p className="mt-3 text-[0.92rem] leading-relaxed text-quiet">{s.text}</p>
              </li>
            ))}
          </ol>
        </Container>
      </Section>

      {/* Yayınlar */}
      <Section labelledBy="pubs-title" tone={pubsTone}>
        <Container>
          <div className="reveal">
            <SectionHeader
              index={pubsIndex}
              eyebrow="Yayınlar"
              id="pubs-title"
              title={d.publicationsTitle}
              intro={d.publicationsIntro}
              action={publications.length ? <LinkArrow href="/yayinlar">Tüm yayınlar</LinkArrow> : undefined}
            />
          </div>
          <div className="mt-12 lg:mt-16">
            {publications.length ? (
              <ul className="grid gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
                {publications.map((p) => (
                  <li key={p.id} className="reveal">
                    <PublicationCard pub={p} showCover />
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState title="Henüz yayın bulunmuyor.">{d.publicationsEmpty}</EmptyState>
            )}
          </div>
        </Container>
      </Section>

      {/* İletişim çağrısı */}
      <Section tone="dark" labelledBy="contact-title">
        <Container>
          <div className="grid grid-cols-12 md:gap-x-8 gap-y-10">
            <div className="col-span-12 flex items-center gap-4 lg:col-span-3 lg:flex-col lg:items-start lg:gap-3">
              <span className="index-num !text-background/70">{contactIndex}</span>
              <span aria-hidden="true" className="h-px w-10 bg-background/40 lg:w-8" />
              <span className="eyebrow">İletişim</span>
            </div>
            <div className="reveal col-span-12 lg:col-span-6">
              <h2 id="contact-title" className="display-lg">
                {d.contactTitle}
              </h2>
              <p className="lead mt-6 max-w-xl">{d.contactText}</p>
              <div className="mt-9">
                <ButtonLink href="/iletisim" variant="light" arrow>
                  {d.contactCtaLabel}
                </ButtonLink>
              </div>
            </div>
            {settings.address || settings.phone || settings.email ? (
              <address className="reveal col-span-12 space-y-3 text-[0.98rem] not-italic leading-relaxed text-background/80 lg:col-span-3 lg:pt-3">
                {settings.address ? <p className="whitespace-pre-line">{settings.address}</p> : null}
                {settings.phone ? (
                  <p>
                    <a href={telHref(settings.phone)} className="underline-offset-4 hover:underline">
                      {settings.phone}
                    </a>
                  </p>
                ) : null}
                {settings.email ? (
                  <p>
                    <a href={`mailto:${settings.email}`} className="underline-offset-4 hover:underline">
                      {settings.email}
                    </a>
                  </p>
                ) : null}
              </address>
            ) : null}
          </div>
        </Container>
      </Section>
    </>
  );
}
