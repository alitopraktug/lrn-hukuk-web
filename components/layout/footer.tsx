import Link from "next/link";
import { Logo } from "@/components/ui/media";
import { Container } from "@/components/ui/primitives";
import { CookiePreferencesButton } from "@/components/layout/consent-manager";
import type { SiteSettingsView } from "@/lib/data/site";
import { telHref } from "@/lib/utils";
import { UI, localizePath, type Locale } from "@/lib/i18n/config";

const linkClass = "inline-block py-1.5 text-[0.95rem] text-background/75 transition-colors hover:text-background";

/**
 * `locale="en"` ile menü/etiketler İngilizceye döner. Hukuki sayfalar (KVKK/Çerez/Gizlilik/Kullanım
 * Koşulları) henüz çevrilmediği için EN sürümde de Türkçe sayfaya bağlanır — yalnızca bağlantı
 * etiketi İngilizcedir (bkz. README → Bilinen sınırlamalar).
 */
export function Footer({ settings, locale = "tr" }: { settings: SiteSettingsView; locale?: Locale }) {
  const year = new Date().getFullYear();
  const social = Object.entries(settings.social).filter(([, v]) => v);
  const socialLabels: Record<string, string> = { linkedin: "LinkedIn", instagram: "Instagram", x: "X", facebook: "Facebook" };
  const t = UI[locale];

  const quickLinks = [
    { href: localizePath("/hakkimizda", locale), label: t.nav.about },
    { href: localizePath("/ekibimiz", locale), label: t.nav.team },
    { href: localizePath("/calisma-alanlari", locale), label: t.nav.areas },
    { href: localizePath("/yayinlar", locale), label: t.nav.publications },
    { href: localizePath("/iletisim", locale), label: t.nav.contact },
  ];
  const legalLinks =
    locale === "tr"
      ? [
          { href: "/kvkk", label: "KVKK Aydınlatma Metni" },
          { href: "/cerez-politikasi", label: "Çerez Politikası" },
          { href: "/gizlilik", label: "Gizlilik" },
          { href: "/kullanim-kosullari", label: "Kullanım Koşulları" },
        ]
      : [
          { href: "/kvkk", label: "Privacy Notice (KVKK, Turkish)" },
          { href: "/cerez-politikasi", label: "Cookie Policy (Turkish)" },
          { href: "/gizlilik", label: "Privacy (Turkish)" },
          { href: "/kullanim-kosullari", label: "Terms of Use (Turkish)" },
        ];

  return (
    <footer data-site-footer className="on-dark bg-ink text-background">
      <Container className="pb-8 pt-16 sm:pt-20 lg:pt-24">
        <Logo logo={settings.logo} firmName={settings.firmName} variant="stacked" tone="light" height={76} className="opacity-95" />

        <div className="mt-14 grid grid-cols-12 border-t border-background/15 pt-14 md:gap-x-8 gap-y-12 sm:mt-16 lg:mt-20">
          <div className="col-span-12 lg:col-span-5">
            <p className="max-w-md text-[0.95rem] leading-relaxed text-background/70">{settings.footerText}</p>
          </div>

          <nav aria-label={t.footerLinksTitle} className="col-span-6 lg:col-span-2">
            <h2 className="eyebrow mb-4 font-sans">{t.footerLinksTitle}</h2>
            <ul>
              {quickLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className={linkClass}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="col-span-6 lg:col-span-3">
            <h2 className="eyebrow mb-4 font-sans">{t.footerContactTitle}</h2>
            <address className="text-[0.95rem] not-italic leading-relaxed text-background/75">
              {settings.address ? <p className="mb-3 whitespace-pre-line">{settings.address}</p> : null}
              {settings.phone ? (
                <p>
                  <a href={telHref(settings.phone)} className={linkClass}>
                    {settings.phone}
                  </a>
                </p>
              ) : null}
              {settings.email ? (
                <p>
                  <a href={`mailto:${settings.email}`} className={linkClass}>
                    {settings.email}
                  </a>
                </p>
              ) : null}
              {!settings.address && !settings.phone && !settings.email ? (
                <p>
                  <Link href={localizePath("/iletisim", locale)} className={linkClass}>
                    {t.footerContactFormLink}
                  </Link>
                </p>
              ) : null}
            </address>
            {social.length ? (
              <ul className="mt-3 flex flex-wrap gap-x-5">
                {social.map(([k, v]) => (
                  <li key={k}>
                    <a href={v} target="_blank" rel="noopener noreferrer" className={linkClass}>
                      {socialLabels[k] ?? k}
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <nav aria-label={t.footerLegalTitle} className="col-span-12 sm:col-span-6 lg:col-span-2">
            <h2 className="eyebrow mb-4 font-sans">{t.footerLegalTitle}</h2>
            <ul>
              {legalLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className={linkClass}>
                    {l.label}
                  </Link>
                </li>
              ))}
              <li>
                <CookiePreferencesButton gaId={settings.gaMeasurementId || null} className={`${linkClass} cursor-pointer text-left`} label={t.cookiePrefs} />
              </li>
            </ul>
          </nav>
        </div>

        <div className="mt-14 flex flex-col gap-2 border-t border-background/15 pt-6 text-[0.82rem] text-background/55 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {settings.firmName}. {t.footerRights}
          </p>
          <p>{t.footerLocation}</p>
        </div>
      </Container>
    </footer>
  );
}
