import type { Metadata } from "next";
import { Hero } from "@/components/home/hero";
import { PracticeAreaList } from "@/components/practice/practice-area-list";
import { PublicationCard } from "@/components/publications/publication-card";
import { TeamGrid } from "@/components/team/team-grid";
import { ButtonLink, Container, EmptyState, LinkArrow, Section, SectionHeader } from "@/components/ui/primitives";
import { getPage, getSiteSettings } from "@/lib/data/site";
import { getPracticeAreas } from "@/lib/data/areas";
import { getTeamMembers } from "@/lib/data/team";
import { getLatestPublications } from "@/lib/data/publications";
import { buildMetadata } from "@/lib/seo";
import { splitParagraphs } from "@/lib/text";
import { pad2, telHref } from "@/lib/utils";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const [s, page] = await Promise.all([getSiteSettings(), getPage("home")]);
  return buildMetadata(
    { path: "/", seoTitle: page.seoTitle, description: page.seoDescription || s.defaultDescription, image: page.ogImage, absoluteTitle: true, title: s.defaultTitle },
    s,
  );
}

export default async function HomePage() {
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
  const approachRows = [1, 2, 3, 4].map((i) => ({ title: a[`principle${i}Title`], text: a[`principle${i}Text`] }));

  // Bölüm numaraları, gösterilen bölümlere göre ardışık verilir. Mimari ara (fotoğraf) ve koyu
  // bölümler kendi görsel ritimleri olduğu için numaralandırma sistemine dahil edilmez.
  let n = 0;
  const next = () => pad2(++n);
  const aboutIndex = next();
  const areasIndex = next();
  const approachIndex = next();
  const teamIndex = team.length > 0 ? next() : null;
  const pubsIndex = next();
  const contactIndex = next();

  return (
    <>
      <Hero eyebrow={d.heroEyebrow} title={d.heroTitle} lead={d.heroLead} primaryLabel={d.heroPrimaryCta} secondaryLabel={d.heroSecondaryCta} />

      {/* 03 · Hakkımızda / giriş */}
      <Section labelledBy="about-title">
        <Container>
          <div className="grid grid-cols-12 md:gap-x-8 gap-y-10">
            <div className="col-span-12 flex items-center gap-4 lg:col-span-3 lg:flex-col lg:items-start lg:gap-3">
              <span className="index-num">{aboutIndex}</span>
              <span aria-hidden="true" className="h-px w-10 bg-wine/60 lg:w-8" />
              <span className="eyebrow">{d.aboutEyebrow}</span>
            </div>
            <div className="col-span-12 lg:col-span-5">
              <h2 id="about-title" className="display-lg">
                {d.aboutTitle}
              </h2>
            </div>
            <div className="col-span-12 space-y-5 text-[1.02rem] leading-[1.8] text-quiet lg:col-span-4 lg:pt-3">
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

      {/* 04 · Mimari ara — gerçek ofis/mimari fotoğrafı eklenene kadarki yer tutucu (bkz. README) */}
      <ArchitecturalBreak />

      {/* 05 · Çalışma alanları — editoryal satırlar (kart ızgarası değil) */}
      <Section labelledBy="areas-title" tone="surface">
        <Container>
          <SectionHeader
            index={areasIndex}
            eyebrow="Çalışma Alanlarımız"
            id="areas-title"
            title={d.practiceTitle}
            intro={d.practiceIntro}
            action={<LinkArrow href="/calisma-alanlari">Tümünü gör</LinkArrow>}
          />
          <div className="mt-12 lg:mt-16">
            {areas.length ? <PracticeAreaList areas={areas} /> : <EmptyState title="Çalışma alanları yakında yayımlanacaktır." />}
          </div>
        </Container>
      </Section>

      {/* 06 · Çalışma Yaklaşımımız — sitedeki tek büyük koyu bölümlerden biri */}
      <Section labelledBy="approach-title" tone="dark">
        <Container>
          <div className="grid grid-cols-12 md:gap-x-8 gap-y-14">
            <div className="col-span-12 lg:col-span-6">
              <div className="flex items-center gap-4">
                <span className="index-num !text-background/70">{approachIndex}</span>
                <span aria-hidden="true" className="h-px w-10 bg-background/40" />
                <span className="eyebrow">Yaklaşımımız</span>
              </div>
              <p id="approach-title" className="display-lg mt-7 max-w-xl">
                {d.approachStatement}
              </p>
            </div>
            <div className="col-span-12 lg:col-span-6 lg:pt-2">
              <ul className="divide-y divide-background/15 border-t border-background/15">
                {approachRows.map((r, i) => (
                  <li key={i} className="flex flex-col gap-1.5 py-6 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8">
                    <span className="font-serif text-[1.5rem] leading-tight text-background">{r.title}</span>
                    <span className="max-w-sm text-[0.92rem] leading-relaxed text-background/65">{r.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </Section>

      {/* 07 · Ekip — yalnızca yayında en az bir profil varsa */}
      {teamIndex ? (
        <Section labelledBy="team-title">
          <Container>
            <SectionHeader
              index={teamIndex}
              eyebrow="Ekibimiz"
              id="team-title"
              title={d.teamTitle}
              intro={d.teamIntro}
              action={<LinkArrow href="/ekibimiz">Tüm ekip</LinkArrow>}
            />
            <TeamGrid members={team} className="mt-12 lg:mt-16" />
          </Container>
        </Section>
      ) : null}

      {/* 08 · Yayınlar */}
      <Section labelledBy="pubs-title" tone="surface">
        <Container>
          <SectionHeader
            index={pubsIndex}
            eyebrow="Yayınlar"
            id="pubs-title"
            title={d.publicationsTitle}
            intro={d.publicationsIntro}
            action={publications.length ? <LinkArrow href="/yayinlar">Tüm yayınlar</LinkArrow> : undefined}
          />
          <div className="mt-12 lg:mt-16">
            {publications.length ? (
              <ul className="grid gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
                {publications.map((p) => (
                  <li key={p.id}>
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

      {/* 09 · İletişim çağrısı */}
      <Section tone="dark" labelledBy="contact-title">
        <Container>
          <div className="grid grid-cols-12 md:gap-x-8 gap-y-10">
            <div className="col-span-12 flex items-center gap-4 lg:col-span-3 lg:flex-col lg:items-start lg:gap-3">
              <span className="index-num !text-background/70">{contactIndex}</span>
              <span aria-hidden="true" className="h-px w-10 bg-background/40 lg:w-8" />
              <span className="eyebrow">İletişim</span>
            </div>
            <div className="col-span-12 lg:col-span-6">
              <h2 id="contact-title" className="display-lg">
                {d.contactTitle}
              </h2>
              <p className="lead mt-6 max-w-xl">{d.contactText}</p>
              <div className="mt-9">
                <ButtonLink href="/iletisim" variant="light">
                  {d.contactCtaLabel}
                </ButtonLink>
              </div>
            </div>
            {settings.address || settings.phone || settings.email ? (
              <address className="col-span-12 space-y-3 text-[0.98rem] not-italic leading-relaxed text-background/80 lg:col-span-3 lg:pt-3">
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

/**
 * Metin/kart yoğunluğunu kırmak için tek, kontrollü bir görsel duraklama.
 * Gerçek ofis/mimari fotoğrafı geldiğinde bu bileşendeki desen yerine img/next-image ile
 * değiştirilebilir (bkz. README → "Fotoğraf yer tutucuları").
 */
function ArchitecturalBreak() {
  return (
    <div aria-hidden="true" className="on-dark relative h-[56vh] min-h-[320px] w-full overflow-hidden bg-ink text-background sm:h-[64vh] lg:h-[72vh]">
      <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 100">
        <line x1="0" y1="0" x2="100" y2="62" stroke="currentColor" strokeOpacity="0.16" strokeWidth="0.1" />
        <line x1="0" y1="30" x2="100" y2="100" stroke="currentColor" strokeOpacity="0.16" strokeWidth="0.1" />
        <line x1="38" y1="0" x2="38" y2="100" stroke="currentColor" strokeOpacity="0.09" strokeWidth="0.06" />
        <line x1="72" y1="0" x2="72" y2="100" stroke="currentColor" strokeOpacity="0.09" strokeWidth="0.06" />
      </svg>
      <div className="absolute bottom-8 left-5 sm:bottom-10 sm:left-8 lg:left-12 xl:left-16">
        <p className="text-[0.66rem] font-semibold uppercase tracking-[0.26em] text-background/55">LRN Hukuk · Ankara</p>
      </div>
    </div>
  );
}
