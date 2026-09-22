import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ConsentManager } from "@/components/layout/consent-manager";
import { Logo } from "@/components/ui/media";
import { JsonLd } from "@/components/ui/seo-blocks";
import { getSiteSettings } from "@/lib/data/site";
import { organizationLd, websiteLd } from "@/lib/jsonld";
import { UI, type Locale } from "@/lib/i18n/config";

/**
 * Herkese açık sitenin ortak kabuğu: atlama bağlantısı, üst menü, içerik, alt bilgi, çerez tercihi ve JSON-LD.
 * `locale="en"` ile menü/footer/çerez metinleri İngilizceye döner (bkz. app/en/layout.tsx). Kök <html lang>
 * kasıtlı olarak sabit "tr" kalır (headers()/cookies() ISR'ı kırar — bkz. app/layout.tsx); bu yüzden gerçek
 * dil burada, bu alt ağacı saran bir <div lang="en"> ile verilir — ekran okuyucu telaffuzu ve CSS
 * text-transform büyütme kuralları (TR'de "i" → "İ") için bu yeterlidir.
 */
export async function PublicShell({ children, locale = "tr" }: { children: React.ReactNode; locale?: Locale }) {
  const settings = await getSiteSettings();
  const t = UI[locale];
  return (
    <div lang={locale}>
      <a
        href="#icerik"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:bg-wine focus:px-4 focus:py-3 focus:text-sm focus:font-semibold focus:text-background"
      >
        {t.skipToContent}
      </a>
      <Header
        logo={<Logo logo={settings.logo} firmName={settings.firmName} height={38} priority />}
        menuLogo={<Logo logo={settings.logo} firmName={settings.firmName} height={34} />}
        contact={{ phone: settings.phone, email: settings.email }}
        locale={locale}
      />
      <main id="icerik" tabIndex={-1} className="outline-none">
        {children}
      </main>
      <Footer settings={settings} locale={locale} />
      <ConsentManager gaId={settings.gaMeasurementId || null} locale={locale} />
      <JsonLd data={organizationLd(settings)} />
      <JsonLd data={websiteLd(settings)} />
    </div>
  );
}
