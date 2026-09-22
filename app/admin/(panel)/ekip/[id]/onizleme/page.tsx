import { notFound } from "next/navigation";
import { TeamProfile } from "@/components/team/team-profile";
import { requireUser } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { mediaRefSelect } from "@/lib/data/types";

export const metadata = { title: "Önizleme", robots: { index: false, follow: false } };

export default async function TeamPreviewPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser({ permission: "team:manage" });
  const { id } = await params;
  const m = await db.teamMember.findFirst({
    where: { id, deletedAt: null },
    include: {
      photo: { select: mediaRefSelect },
      practiceAreas: { where: { deletedAt: null }, orderBy: { sortOrder: "asc" }, select: { id: true, slug: true, title: true, shortDescription: true, sortOrder: true } },
    },
  });
  if (!m) notFound();

  return (
    <div className="-mx-4 -my-8 bg-background sm:-mx-8 lg:-my-10">
      <div role="status" className="sticky top-14 z-20 border-b border-wine/30 bg-wine px-4 py-2.5 text-center text-[0.85rem] font-semibold text-white lg:top-0">
        Önizleme — bu sayfa yalnızca siz görebilirsiniz.
      </div>
      <div className="pt-10">
        <TeamProfile
          member={{
            id: m.id,
            slug: m.slug,
            fullName: m.fullName,
            title: m.title,
            shortBio: m.shortBio,
            photoPosition: m.photoPosition,
            photo: m.photo,
            bio: m.bio,
            education: m.education,
            barAssociation: m.barAssociation,
            tbbNo: m.tbbNo,
            barNo: m.barNo,
            careerStart: m.careerStart,
            languages: m.languages,
            writings: m.writings,
            email: m.email,
            linkedin: m.linkedin,
            hiddenFields: m.hiddenFields,
            seoTitle: m.seoTitle,
            seoDescription: m.seoDescription,
            updatedAt: m.updatedAt,
            practiceAreas: m.practiceAreas,
            ogImage: m.photo,
          }}
        />
      </div>
    </div>
  );
}
