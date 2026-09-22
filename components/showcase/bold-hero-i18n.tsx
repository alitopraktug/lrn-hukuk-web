"use client";

import { useState, type ReactElement } from "react";
import { Container, ButtonLink, Emphasis } from "@/components/ui/primitives";

type Lang = "tr" | "en" | "de" | "ru";
type Copy = { eyebrow: string; title: string; lead: string; primary: string; secondary: string };

const LABEL: Record<Lang, string> = { tr: "Türkçe", en: "English", de: "Deutsch", ru: "Русский" };

/** Emoji bayrak yerine küçük satır içi SVG: işletim sistemi/yazı tipinden bağımsız, her yerde aynı görünür. */
const FLAG_SVG: Record<Lang, ReactElement> = {
  tr: (
    <svg viewBox="0 0 30 20" className="h-full w-full" aria-hidden="true">
      <rect width="30" height="20" fill="#E30A17" />
      <circle cx="12.5" cy="10" r="5" fill="#fff" />
      <circle cx="13.9" cy="10" r="4" fill="#E30A17" />
      <path d="M17.5 10 22 8.4 19.1 12.1 19.1 7.9 22 11.6Z" fill="#fff" />
    </svg>
  ),
  en: (
    <svg viewBox="0 0 30 20" className="h-full w-full" aria-hidden="true">
      <rect width="30" height="20" fill="#00247d" />
      <path d="M0 0 30 20M30 0 0 20" stroke="#fff" strokeWidth="4" />
      <path d="M0 0 13 8.6M30 0 17 11.4M0 20 13 11.4M30 20 17 8.6" stroke="#cf142b" strokeWidth="1.6" />
      <path d="M15 0V20M0 10H30" stroke="#fff" strokeWidth="6.6" />
      <path d="M15 0V20M0 10H30" stroke="#cf142b" strokeWidth="4" />
    </svg>
  ),
  de: (
    <svg viewBox="0 0 30 20" className="h-full w-full" aria-hidden="true">
      <rect width="30" height="6.67" fill="#000" />
      <rect y="6.67" width="30" height="6.67" fill="#DD0000" />
      <rect y="13.33" width="30" height="6.67" fill="#FFCE00" />
    </svg>
  ),
  ru: (
    <svg viewBox="0 0 30 20" className="h-full w-full" aria-hidden="true">
      <rect width="30" height="6.67" fill="#fff" />
      <rect y="6.67" width="30" height="6.67" fill="#0039A6" />
      <rect y="13.33" width="30" height="6.67" fill="#D52B1E" />
    </svg>
  ),
};

/**
 * DEMO amaçlı statik çeviriler — yalnızca kapak (hero) metni için. Panelden girilen Türkçe metne
 * gerçek zamanlı bağlı değildir; müşteriye "çok dilli olabilir" fikrini göstermek içindir.
 * Üretime alınacaksa: gerçek bir i18n rotalaması (ör. next-intl) ve ana dili konuşan biri tarafından
 * gözden geçirilmiş çeviri gerekir — bu metinler yalnızca taslaktır.
 */
function translations(tr: Copy): Record<Lang, Copy> {
  return {
    tr,
    en: {
      eyebrow: "LRN LAW · ANKARA",
      title: "*Clear communication* and careful work in legal matters.",
      lead: "LRN Law is a law firm based in Ankara. We work on individual and corporate legal matters in labour and social security, criminal, health, corporate, commercial, family and administrative law.",
      primary: "View Practice Areas",
      secondary: "Contact",
    },
    de: {
      eyebrow: "LRN RECHT · ANKARA",
      title: "*Offene Kommunikation* und sorgfältige Arbeit in Rechtsfragen.",
      lead: "LRN Recht ist eine Anwaltskanzlei mit Sitz in Ankara. Wir bearbeiten individuelle und unternehmensbezogene Rechtsangelegenheiten im Arbeits- und Sozialversicherungsrecht, Strafrecht, Gesundheitsrecht, Gesellschaftsrecht, Handelsrecht, Familienrecht und Verwaltungsrecht.",
      primary: "Rechtsgebiete ansehen",
      secondary: "Kontakt",
    },
    ru: {
      eyebrow: "LRN ПРАВО · АНКАРА",
      title: "*Открытое общение* и внимательная работа в юридических вопросах.",
      lead: "LRN Хукук — юридическая фирма в Анкаре. Мы ведём индивидуальные и корпоративные дела в области трудового и социального права, уголовного, медицинского, корпоративного, коммерческого, семейного и административного права.",
      primary: "Практики",
      secondary: "Контакты",
    },
  };
}

export function BoldHeroI18n({
  eyebrow,
  title,
  lead,
  primaryLabel,
  secondaryLabel,
}: {
  eyebrow: string;
  title: string;
  lead: string;
  primaryLabel: string;
  secondaryLabel: string;
}) {
  const [lang, setLang] = useState<Lang>("tr");
  const dict = translations({ eyebrow, title, lead, primary: primaryLabel, secondary: secondaryLabel });
  const c = dict[lang];

  return (
    <section aria-labelledby="hero-title" className="on-dark relative overflow-hidden bg-forest-dark text-background">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden lg:block">
        <div className="mx-auto h-full w-full max-w-[1320px] px-12">
          <div className="grid h-full grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="border-l border-background/10 last:border-r" />
            ))}
          </div>
        </div>
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/logo-mark-light.svg"
        alt=""
        aria-hidden="true"
        width={862}
        height={792}
        className="pointer-events-none absolute -bottom-[18%] -right-[10%] w-[62%] max-w-[760px] opacity-[0.08] sm:opacity-[0.1]"
      />

      <Container className="relative">
        <nav aria-label="Dil seçimi (demo)" className="flex justify-end gap-2 pt-6 sm:pt-8">
          {(Object.keys(FLAG_SVG) as Lang[]).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLang(l)}
              aria-pressed={lang === l}
              aria-label={LABEL[l]}
              title={LABEL[l]}
              className={`h-7 w-7 overflow-hidden rounded-full ring-offset-2 ring-offset-forest-dark transition-[opacity,box-shadow] ${lang === l ? "opacity-100 ring-2 ring-background/70" : "opacity-55 hover:opacity-90"}`}
            >
              {FLAG_SVG[l]}
            </button>
          ))}
        </nav>

        <div className="grid min-h-[max(64vh,28rem)] grid-cols-12 items-center md:gap-x-8 gap-y-10 pb-16 pt-10 sm:pb-24 lg:min-h-[max(76vh,38rem)] lg:pb-28">
          <div className="col-span-12 lg:col-span-8">
            <p className="eyebrow text-background/70">{c.eyebrow}</p>
            <h1 id="hero-title" className="display-xl mt-7 max-w-[16em] text-background sm:mt-9">
              <Emphasis text={c.title} />
            </h1>
            <p className="lead mt-8 max-w-xl text-background/80">{c.lead}</p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
              <ButtonLink href="/calisma-alanlari" variant="light" arrow>
                {c.primary}
              </ButtonLink>
              <ButtonLink href="/iletisim" variant="outline-light">
                {c.secondary}
              </ButtonLink>
            </div>
            {lang !== "tr" ? <p className="mt-6 text-[0.78rem] text-background/50">{LABEL[lang]} — demo çevirisi. Sitenin geri kalanı şu an Türkçedir.</p> : null}
          </div>
        </div>
      </Container>
    </section>
  );
}
