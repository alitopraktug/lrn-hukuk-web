import type { Metadata } from "next";
import { NotFoundContent } from "@/components/layout/not-found-content";
import { PublicShell } from "@/components/layout/public-shell";
import { getSiteSettings } from "@/lib/data/site";

export const metadata: Metadata = {
  title: "Sayfa bulunamadı",
  robots: { index: false, follow: false },
};

/** Eşleşmeyen adresler için 404 (kök düzen altında çalıştığından üst menü/alt bilgi burada eklenir). */
export default async function NotFound() {
  // Veritabanı erişilemese bile 404 sayfası çalışsın: ayarlar okunamazsa kabuksuz (yalın) sürüm gösterilir.
  const shellAvailable = await getSiteSettings().then(
    () => true,
    () => false,
  );
  if (!shellAvailable) return <NotFoundContent />;
  return (
    <PublicShell>
      <NotFoundContent />
    </PublicShell>
  );
}
