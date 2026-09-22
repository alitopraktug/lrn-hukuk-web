import { notFound } from "next/navigation";
import { AreaDetailView } from "@/components/practice/area-detail-view";
import { requireUser } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { mediaRefSelect } from "@/lib/data/types";
import { getSiteSettings } from "@/lib/data/site";
import { publicationCardSelect, teamCardSelect } from "@/lib/data/where";

export const metadata = { title: "Önizleme", robots: { index: false, follow: false } };

export default async function AreaPreviewPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser({ permission: "area:manage" });
  const { id } = await params;
  const [area, settings] = await Promise.all([
    db.practiceArea.findFirst({
      where: { id, deletedAt: null },
      include: {
        cover: { select: mediaRefSelect },
        ogImage: { select: mediaRefSelect },
        teamMembers: { where: { deletedAt: null }, orderBy: { sortOrder: "asc" }, select: teamCardSelect },
        relatedPublications: { where: { deletedAt: null }, orderBy: { updatedAt: "desc" }, take: 6, select: publicationCardSelect },
      },
    }),
    getSiteSettings(),
  ]);
  if (!area) notFound();

  return (
    <div className="-mx-4 -my-8 bg-background sm:-mx-8 lg:-my-10">
      <div role="status" className="sticky top-14 z-20 border-b border-wine/30 bg-wine px-4 py-2.5 text-center text-[0.85rem] font-semibold text-white lg:top-0">
        Önizleme — bu sayfa yalnızca siz görebilirsiniz.
      </div>
      <AreaDetailView
        crumbs={false}
        disclaimer={settings.publicationDisclaimer}
        area={{
          id: area.id,
          slug: area.slug,
          title: area.title,
          shortDescription: area.shortDescription,
          content: area.content,
          topics: area.topics,
          cover: area.cover,
          ogImage: area.ogImage,
          seoTitle: area.seoTitle,
          seoDescription: area.seoDescription,
          updatedAt: area.updatedAt,
          team: area.teamMembers,
          publications: area.relatedPublications,
        }}
      />
    </div>
  );
}
