import Link from "next/link";
import { Logo } from "@/components/ui/media";
import { Container } from "@/components/ui/primitives";
import { CookiePreferencesButton } from "@/components/layout/consent-manager";
import type { SiteSettingsView } from "@/lib/data/site";
import { telHref } from "@/lib/utils";

const QUICK_LINKS = [
  { href: "/hakkimizda", label: "Hakkımızda" },
  { href: "/ekibimiz", label: "Ekibimiz" },
  { href: "/calisma-alanlari", label: "Çalışma Alanlarımız" },
  { href: "/yayinlar", label: "Yayınlar" },
  { href: "/iletisim", label: "İletişim" },
];

const LEGAL_LINKS = [
  { href: "/kvkk", label: "KVKK Aydınlatma Metni" },
  { href: "/cerez-politikasi", label: "Çerez Politikası" },
  { href: "/gizlilik", label: "Gizlilik" },
  { href: "/kullanim-kosullari", label: "Kullanım Koşulları" },
];

const linkClass = "inline-block py-1.5 text-[0.95rem] text-background/75 transition-colors hover:text-background";

export function Footer({ settings }: { settings: SiteSettingsView }) {
  const year = new Date().getFullYear();
  const social = Object.entries(settings.social).filter(([, v]) => v);
  const socialLabels: Record<string, string> = { linkedin: "LinkedIn", instagram: "Instagram", x: "X", facebook: "Facebook" };

  return (
    <footer data-site-footer className="on-dark bg-ink text-background">
      <Container className="pb-8 pt-16 sm:pt-20 lg:pt-24">
        <Logo logo={settings.logo} firmName={settings.firmName} variant="stacked" tone="light" height={76} className="opacity-95" />

        <div className="mt-14 grid grid-cols-12 border-t border-background/15 pt-14 md:gap-x-8 gap-y-12 sm:mt-16 lg:mt-20">
          <div className="col-span-12 lg:col-span-5">
            <p className="max-w-md text-[0.95rem] leading-relaxed text-background/70">{settings.footerText}</p>
          </div>

          <nav aria-label="Hızlı bağlantılar" className="col-span-6 lg:col-span-2">
            <h2 className="eyebrow mb-4 font-sans">Hızlı Bağlantılar</h2>
            <ul>
              {QUICK_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className={linkClass}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="col-span-6 lg:col-span-3">
            <h2 className="eyebrow mb-4 font-sans">İletişim</h2>
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
                  <Link href="/iletisim" className={linkClass}>
                    İletişim formu
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

          <nav aria-label="Yasal bağlantılar" className="col-span-12 sm:col-span-6 lg:col-span-2">
            <h2 className="eyebrow mb-4 font-sans">Bilgilendirme</h2>
            <ul>
              {LEGAL_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className={linkClass}>
                    {l.label}
                  </Link>
                </li>
              ))}
              <li>
                <CookiePreferencesButton gaId={settings.gaMeasurementId || null} className={`${linkClass} cursor-pointer text-left`} />
              </li>
            </ul>
          </nav>
        </div>

        <div className="mt-14 flex flex-col gap-2 border-t border-background/15 pt-6 text-[0.82rem] text-background/55 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {settings.firmName}. Tüm hakları saklıdır.
          </p>
          <p>Ankara, Türkiye</p>
        </div>
      </Container>
    </footer>
  );
}
