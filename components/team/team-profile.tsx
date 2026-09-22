import Link from "next/link";
import { PortraitPlaceholder } from "@/components/team/team-card";
import { MediaImage } from "@/components/ui/media";
import { Container, LinkArrow } from "@/components/ui/primitives";
import { RichText } from "@/components/ui/seo-blocks";
import { prepareRichText } from "@/lib/richtext";
import { formatMonthYear } from "@/lib/utils";
import type { TeamDetail } from "@/lib/data/team";
import { UI, localizePath, type Locale } from "@/lib/i18n/config";

const show = (m: Pick<TeamDetail, "hiddenFields">, key: string) => !m.hiddenFields.includes(key);

const LABELS = {
  tr: { bar: "Kayıtlı olduğu baro", tbb: "TBB sicil no", barNo: "Baro sicil no", careerStart: "Mesleğe başlama", bio: "Özgeçmiş", education: "Eğitim", professional: "Mesleki Bilgiler", areas: "Çalışma Alanları", languages: "Yabancı Diller", writings: "Yayınlar" },
  en: { bar: "Bar association", tbb: "Bar Association ID", barNo: "Bar registry no.", careerStart: "Started practising", bio: "Background", education: "Education", professional: "Professional Information", areas: "Practice Areas", languages: "Languages", writings: "Publications" },
} as const;

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section aria-label={title} className="mt-12 grid gap-4 border-t border-foreground/20 pt-7 md:grid-cols-[9.5rem_1fr] md:gap-8">
      <h2 className="eyebrow !font-sans">{title}</h2>
      <div>{children}</div>
    </section>
  );
}

/**
 * Avukat profili (herkese açık sayfa ve yönetim paneli önizlemesi tarafından ortak kullanılır).
 * Boş alanlar için başlık GÖSTERİLMEZ; ayrıca yönetim panelinden "profilde göster" kutuları kapatılan bölümler gizlenir.
 * `locale="en"` ile başlık/bio EN çevirisi (varsa) `member` üzerinde zaten uygulanmış olmalıdır
 * (bkz. lib/i18n/localize.ts → localizeTeamMember); bu bileşen yalnızca sabit etiketleri çevirir.
 */
export function TeamProfile({ member, locale = "tr" }: { member: TeamDetail; locale?: Locale }) {
  const l = LABELS[locale];
  const t = UI[locale];
  const bio = member.bio.trim() ? prepareRichText(member.bio) : null;
  const barRows: [string, string][] = [];
  if (show(member, "barInfo")) {
    if (member.barAssociation) barRows.push([l.bar, member.barAssociation]);
    if (member.tbbNo) barRows.push([l.tbb, member.tbbNo]);
    if (member.barNo) barRows.push([l.barNo, member.barNo]);
  }
  if (show(member, "careerStart") && member.careerStart) barRows.push([l.careerStart, formatMonthYear(member.careerStart)]);

  const education = show(member, "education") ? member.education : [];
  const languages = show(member, "languages") ? member.languages : [];
  const writings = show(member, "writings") ? member.writings : [];
  const areas = show(member, "practiceAreas") ? member.practiceAreas : [];
  const email = show(member, "email") && member.email ? member.email : null;
  const linkedin = show(member, "linkedin") && member.linkedin ? member.linkedin : null;

  return (
    <Container className="pb-20 pt-6 sm:pb-24 lg:pb-32">
      <div className="grid grid-cols-12 md:gap-x-8 gap-y-10">
        <div className="col-span-12 md:col-span-5 lg:col-span-4">
          <div className="md:sticky md:top-[calc(var(--header-h)+24px)]">
            <div className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden bg-stone/25 md:max-w-none">
              {member.photo ? (
                <MediaImage
                  media={member.photo}
                  fill
                  priority
                  sizes="(min-width: 1024px) 30vw, (min-width: 768px) 40vw, 90vw"
                  className="object-cover"
                  style={{ objectPosition: member.photoPosition }}
                />
              ) : (
                <PortraitPlaceholder />
              )}
              <span aria-hidden="true" className="pointer-events-none absolute inset-0 border border-foreground/10" />
            </div>
          </div>
        </div>

        <div className="col-span-12 md:col-span-7 lg:col-span-8">
          <p className="eyebrow rise">{member.title}</p>
          <h1 className="display-lg mt-4">{member.fullName}</h1>
          {member.shortBio ? <p className="lead mt-6 max-w-2xl">{member.shortBio}</p> : null}

          {email || linkedin ? (
            <p className="mt-6 flex flex-wrap gap-x-8 gap-y-2 text-[0.97rem]">
              {email ? (
                <a href={`mailto:${email}`} className="text-wine underline underline-offset-4 hover:text-wine">
                  {email}
                </a>
              ) : null}
              {linkedin ? (
                <a href={linkedin} target="_blank" rel="noopener noreferrer" className="text-wine underline underline-offset-4 hover:text-wine">
                  LinkedIn
                </a>
              ) : null}
            </p>
          ) : null}

          {bio ? (
            <Block title={l.bio}>
              <RichText prepared={bio} className="!text-[1.02rem] md:!text-[1.05rem]" />
            </Block>
          ) : null}

          {education.length ? (
            <Block title={l.education}>
              <ul className="space-y-2 text-[1.02rem] leading-relaxed">
                {education.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            </Block>
          ) : null}

          {barRows.length ? (
            <Block title={l.professional}>
              <dl className="grid gap-x-8 gap-y-3 text-[1.02rem] sm:grid-cols-[auto_1fr]">
                {barRows.map(([k, v]) => (
                  <div key={k} className="contents">
                    <dt className="text-quiet">{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
            </Block>
          ) : null}

          {areas.length ? (
            <Block title={l.areas}>
              <ul className="flex flex-wrap gap-x-6 gap-y-3">
                {areas.map((a) => (
                  <li key={a.id}>
                    <Link href={`${localizePath("/calisma-alanlari", locale)}/${a.slug}`} className="text-[1.02rem] text-wine underline decoration-wine/30 underline-offset-4 hover:decoration-wine">
                      {a.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </Block>
          ) : null}

          {languages.length ? (
            <Block title={l.languages}>
              <p className="text-[1.02rem]">{languages.join(" · ")}</p>
            </Block>
          ) : null}

          {writings.length ? (
            <Block title={l.writings}>
              <ul className="space-y-3 text-[1.02rem] leading-relaxed">
                {writings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </Block>
          ) : null}

          <div className="mt-14">
            <LinkArrow href={localizePath("/ekibimiz", locale)}>{t.allTeam}</LinkArrow>
          </div>
        </div>
      </div>
    </Container>
  );
}
