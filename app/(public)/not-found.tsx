import type { Metadata } from "next";
import { NotFoundContent } from "@/components/layout/not-found-content";

export const metadata: Metadata = {
  title: "Sayfa bulunamadı",
  robots: { index: false, follow: false },
};

/** notFound() çağrıları için (üst menü ve alt bilgi (public)/layout.tsx'ten gelir). */
export default function NotFound() {
  return <NotFoundContent />;
}
