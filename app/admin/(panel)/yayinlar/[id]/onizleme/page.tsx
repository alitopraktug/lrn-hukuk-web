import { notFound } from "next/navigation";
import { PublicationArticle } from "@/components/publications/publication-article";
import { getPublicationPreview } from "@/lib/admin/queries";
import { requireUser } from "@/lib/auth/guards";
import { getSiteSettings } from "@/lib/data/site";

export const metadata = { title: "Önizleme", robots: { index: false, follow: false } };

/** Yayın önizlemesi: yalnızca oturum açmış yöneticilere açık; taslaklar herkese açık sitede hiçbir zaman sunulmaz. */
export default async function PublicationPreviewPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser({ permission: "publication:manage" });
  const { id } = await params;
  const [pub, settings] = await Promise.all([getPublicationPreview(id), getSiteSettings()]);
  if (!pub) notFound();

  return (
    <div className="-mx-4 -my-8 bg-background sm:-mx-8 lg:-my-10">
      <div role="status" className="sticky top-14 z-20 border-b border-wine/30 bg-wine px-4 py-2.5 text-center text-[0.85rem] font-semibold text-white lg:top-0">
        Önizleme — bu sayfa yalnızca siz görebilirsiniz.
      </div>
      <PublicationArticle pub={pub} disclaimer={settings.publicationDisclaimer} crumbs={false} />
    </div>
  );
}
