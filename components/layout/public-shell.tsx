import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ConsentManager } from "@/components/layout/consent-manager";
import { Logo } from "@/components/ui/media";
import { JsonLd } from "@/components/ui/seo-blocks";
import { getSiteSettings } from "@/lib/data/site";
import { organizationLd, websiteLd } from "@/lib/jsonld";

/** Herkese açık sitenin ortak kabuğu: atlama bağlantısı, üst menü, içerik, alt bilgi, çerez tercihi ve JSON-LD. */
export async function PublicShell({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();
  return (
    <>
      <a
        href="#icerik"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:bg-wine focus:px-4 focus:py-3 focus:text-sm focus:font-semibold focus:text-background"
      >
        İçeriğe geç
      </a>
      <Header
        logo={<Logo logo={settings.logo} firmName={settings.firmName} height={38} priority />}
        menuLogo={<Logo logo={settings.logo} firmName={settings.firmName} height={34} />}
        contact={{ phone: settings.phone, email: settings.email }}
      />
      <main id="icerik" tabIndex={-1} className="outline-none">
        {children}
      </main>
      <Footer settings={settings} />
      <ConsentManager gaId={settings.gaMeasurementId || null} />
      <JsonLd data={organizationLd(settings)} />
      <JsonLd data={websiteLd(settings)} />
    </>
  );
}
