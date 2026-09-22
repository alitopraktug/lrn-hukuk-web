import { notFound } from "next/navigation";
import { PublicationForm } from "@/app/admin/(panel)/yayinlar/publication-form";
import { savePublication } from "@/app/admin/(panel)/yayinlar/actions";
import { Alert, PageHeader } from "@/components/admin/ui";
import { getFormOptions, getPickedMedia } from "@/lib/admin/queries";
import { toDateTimeInput } from "@/lib/admin/helpers";
import { requireUser } from "@/lib/auth/guards";
import { db } from "@/lib/db";

export const metadata = { title: "Yayını düzenle" };

export default async function EditPublicationPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ kaydedildi?: string }> }) {
  await requireUser({ permission: "publication:manage" });
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const pub = await db.publication.findUnique({ where: { id }, include: { tags: { select: { name: true } }, relatedAreas: { select: { id: true } } } });
  if (!pub) notFound();

  const [options, cover, ogImage] = await Promise.all([getFormOptions(), getPickedMedia(pub.coverId), getPickedMedia(pub.ogImageId)]);

  return (
    <>
      <PageHeader title="Yayını düzenle" description={pub.title} />
      {pub.deletedAt ? (
        <Alert tone="warning" className="mb-6">
          Bu yayın silinmiş. Düzenlemek için önce “Yayınlar → Silinenler” bölümünden geri yükleyin.
        </Alert>
      ) : (
        <PublicationForm
          key={pub.id}
          id={pub.id}
          action={savePublication}
          saved={sp.kaydedildi === "1"}
          categories={options.categories}
          authors={options.authors}
          areas={options.areas}
          values={{
            title: pub.title,
            slug: pub.slug,
            excerpt: pub.excerpt,
            content: pub.content,
            categoryId: pub.categoryId ?? "",
            tags: pub.tags.map((t) => t.name).join(", "),
            authorId: pub.authorId ?? "",
            authorName: pub.authorName ?? "",
            featured: pub.featured,
            publishedAt: toDateTimeInput(pub.publishedAt),
            seoTitle: pub.seoTitle ?? "",
            seoDescription: pub.seoDescription ?? "",
            areaIds: pub.relatedAreas.map((a) => a.id),
            cover,
            ogImage,
            status: pub.status,
          }}
        />
      )}
    </>
  );
}
