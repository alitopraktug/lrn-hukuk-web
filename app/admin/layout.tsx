import type { Metadata } from "next";

/** Yönetim paneli: dizine alınmaz, önbelleğe alınmaz (next.config.ts ve robots.ts ile birlikte). */
export const metadata: Metadata = {
  title: { default: "Yönetim Paneli", template: "%s · Yönetim Paneli" },
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
