import { AreaForm } from "@/app/admin/(panel)/calisma-alanlari/area-form";
import { saveArea } from "@/app/admin/(panel)/calisma-alanlari/actions";
import { PageHeader } from "@/components/admin/ui";
import { requireUser } from "@/lib/auth/guards";
import { db } from "@/lib/db";

export const metadata = { title: "Yeni çalışma alanı" };

export default async function NewAreaPage() {
  await requireUser({ permission: "area:manage" });
  const [team, publications] = await Promise.all([
    db.teamMember.findMany({ where: { deletedAt: null }, orderBy: { sortOrder: "asc" }, select: { id: true, fullName: true, title: true } }),
    db.publication.findMany({ where: { deletedAt: null }, orderBy: { updatedAt: "desc" }, take: 100, select: { id: true, title: true } }),
  ]);
  return (
    <>
      <PageHeader title="Yeni çalışma alanı" />
      <AreaForm
        id={null}
        action={saveArea}
        team={team}
        publications={publications}
        values={{ title: "", slug: "", shortDescription: "", content: "", topics: "", seoTitle: "", seoDescription: "", teamIds: [], publicationIds: [], cover: null, ogImage: null, status: "DRAFT" }}
      />
    </>
  );
}
