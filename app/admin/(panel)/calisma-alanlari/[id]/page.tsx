import { notFound } from "next/navigation";
import { AreaForm } from "@/app/admin/(panel)/calisma-alanlari/area-form";
import { saveArea } from "@/app/admin/(panel)/calisma-alanlari/actions";
import { Alert, PageHeader } from "@/components/admin/ui";
import { getPickedMedia } from "@/lib/admin/queries";
import { requireUser } from "@/lib/auth/guards";
import { db } from "@/lib/db";

export const metadata = { title: "Çalışma alanını düzenle" };

export default async function EditAreaPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ kaydedildi?: string }> }) {
  await requireUser({ permission: "area:manage" });
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const area = await db.practiceArea.findUnique({ where: { id }, include: { teamMembers: { select: { id: true } }, relatedPublications: { select: { id: true } } } });
  if (!area) notFound();

  const [team, publications, cover, ogImage] = await Promise.all([
    db.teamMember.findMany({ where: { deletedAt: null }, orderBy: { sortOrder: "asc" }, select: { id: true, fullName: true, title: true } }),
    db.publication.findMany({ where: { deletedAt: null }, orderBy: { updatedAt: "desc" }, take: 100, select: { id: true, title: true } }),
    getPickedMedia(area.coverId),
    getPickedMedia(area.ogImageId),
  ]);

  return (
    <>
      <PageHeader title="Çalışma alanını düzenle" description={area.title} />
      {area.deletedAt ? (
        <Alert tone="warning">Bu alan silinmiş. Düzenlemek için önce “Silinenler” sekmesinden geri yükleyin.</Alert>
      ) : (
        <AreaForm
          key={area.id}
          id={area.id}
          action={saveArea}
          saved={sp.kaydedildi === "1"}
          team={team}
          publications={publications}
          values={{
            title: area.title,
            slug: area.slug,
            shortDescription: area.shortDescription,
            content: area.content,
            topics: area.topics.join("\n"),
            seoTitle: area.seoTitle ?? "",
            seoDescription: area.seoDescription ?? "",
            teamIds: area.teamMembers.map((m) => m.id),
            publicationIds: area.relatedPublications.map((p) => p.id),
            cover,
            ogImage,
            status: area.status,
          }}
        />
      )}
    </>
  );
}
