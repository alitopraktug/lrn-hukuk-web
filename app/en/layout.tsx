import type { Metadata } from "next";
import { PublicShell } from "@/components/layout/public-shell";
import { getSiteSettings } from "@/lib/data/site";
import { mediaUrl } from "@/lib/data/types";

/**
 * İngilizce sürümün kabuğu — app/(public)/layout.tsx ile birebir aynı, yalnızca locale="en" geçilir
 * (bkz. PublicShell → Header/Footer/ConsentManager). İçerik: lib/content/defaults.ts'teki `_en` alanları
 * ve lib/i18n/content-en.ts (çalışma alanları/ekip). Ayrıntılar için README → Bilinen sınırlamalar.
 */
export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettings();
  const iconHref = s.favicon ? mediaUrl(s.favicon.id) : null;
  return {
    title: { default: `${s.firmName} | Ankara`, template: `%s | ${s.firmName}` },
    description: s.defaultDescription,
    applicationName: s.firmName,
    icons: iconHref
      ? { icon: iconHref, shortcut: iconHref, apple: iconHref }
      : {
          icon: [
            { url: "/brand/icon.svg", type: "image/svg+xml" },
            { url: "/brand/favicon.ico", sizes: "48x48" },
          ],
          shortcut: "/brand/favicon.ico",
          apple: "/brand/apple-touch-icon.png",
        },
  };
}

export default function EnglishLayout({ children }: { children: React.ReactNode }) {
  return <PublicShell locale="en">{children}</PublicShell>;
}
