import type { Metadata } from "next";
import { PublicShell } from "@/components/layout/public-shell";
import { getSiteSettings } from "@/lib/data/site";
import { mediaUrl } from "@/lib/data/types";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettings();
  const iconHref = s.favicon ? mediaUrl(s.favicon.id) : null;
  return {
    title: { default: s.defaultTitle, template: `%s | ${s.firmName}` },
    description: s.defaultDescription,
    applicationName: s.firmName,
    verification: s.googleSiteVerification ? { google: s.googleSiteVerification } : undefined,
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

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <PublicShell>{children}</PublicShell>;
}
