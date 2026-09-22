import { notFound } from "next/navigation";
import { TeamForm } from "@/app/admin/(panel)/ekip/team-form";
import { saveTeamMember } from "@/app/admin/(panel)/ekip/actions";
import { Alert, PageHeader } from "@/components/admin/ui";
import { getPickedMedia } from "@/lib/admin/queries";
import { toDateInput } from "@/lib/admin/helpers";
import { requireUser } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { TEAM_FIELD_KEYS } from "@/lib/validation/admin";

export const metadata = { title: "Ekip üyesini düzenle" };

export default async function EditTeamMemberPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ kaydedildi?: string }> }) {
  await requireUser({ permission: "team:manage" });
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const m = await db.teamMember.findUnique({ where: { id }, include: { practiceAreas: { select: { id: true } } } });
  if (!m) notFound();

  const [areas, photo] = await Promise.all([
    db.practiceArea.findMany({ where: { deletedAt: null }, orderBy: { sortOrder: "asc" }, select: { id: true, title: true } }),
    getPickedMedia(m.photoId),
  ]);

  return (
    <>
      <PageHeader title="Ekip üyesini düzenle" description={`${m.fullName} · ${m.title}`} />
      {m.deletedAt ? (
        <Alert tone="warning">Bu ekip üyesi silinmiş. Düzenlemek için önce “Silinenler” sekmesinden geri yükleyin.</Alert>
      ) : (
        <TeamForm
          key={m.id}
          id={m.id}
          action={saveTeamMember}
          saved={sp.kaydedildi === "1"}
          areas={areas}
          values={{
            fullName: m.fullName,
            title: m.title,
            slug: m.slug,
            shortBio: m.shortBio,
            bio: m.bio,
            education: m.education.join("\n"),
            barAssociation: m.barAssociation ?? "",
            tbbNo: m.tbbNo ?? "",
            barNo: m.barNo ?? "",
            careerStart: toDateInput(m.careerStart),
            languages: m.languages.join("\n"),
            writings: m.writings.join("\n"),
            email: m.email ?? "",
            linkedin: m.linkedin ?? "",
            photoPosition: m.photoPosition,
            visible: TEAM_FIELD_KEYS.filter((k) => !m.hiddenFields.includes(k)),
            areaIds: m.practiceAreas.map((a) => a.id),
            seoTitle: m.seoTitle ?? "",
            seoDescription: m.seoDescription ?? "",
            photo,
            status: m.status,
          }}
        />
      )}
    </>
  );
}
