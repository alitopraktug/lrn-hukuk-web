import { TeamForm } from "@/app/admin/(panel)/ekip/team-form";
import { saveTeamMember } from "@/app/admin/(panel)/ekip/actions";
import { PageHeader } from "@/components/admin/ui";
import { requireUser } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { TEAM_FIELD_KEYS } from "@/lib/validation/admin";

export const metadata = { title: "Yeni ekip üyesi" };

export default async function NewTeamMemberPage() {
  await requireUser({ permission: "team:manage" });
  const areas = await db.practiceArea.findMany({ where: { deletedAt: null }, orderBy: { sortOrder: "asc" }, select: { id: true, title: true } });
  return (
    <>
      <PageHeader title="Yeni ekip üyesi" description="Kaydettiğinizde /ekibimiz/ad-soyad adresinde profil sayfası otomatik oluşur (aktif hâle getirildiğinde sitede görünür)." />
      <TeamForm
        id={null}
        action={saveTeamMember}
        areas={areas}
        values={{
          fullName: "",
          title: "",
          slug: "",
          shortBio: "",
          bio: "",
          education: "",
          barAssociation: "",
          tbbNo: "",
          barNo: "",
          careerStart: "",
          languages: "",
          writings: "",
          email: "",
          linkedin: "",
          photoPosition: "50% 25%",
          visible: [...TEAM_FIELD_KEYS],
          areaIds: [],
          seoTitle: "",
          seoDescription: "",
          photo: null,
          status: "DRAFT",
        }}
      />
    </>
  );
}
