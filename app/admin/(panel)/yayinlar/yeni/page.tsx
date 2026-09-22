import { PublicationForm } from "@/app/admin/(panel)/yayinlar/publication-form";
import { savePublication } from "@/app/admin/(panel)/yayinlar/actions";
import { PageHeader } from "@/components/admin/ui";
import { getFormOptions } from "@/lib/admin/queries";
import { requireUser } from "@/lib/auth/guards";

export const metadata = { title: "Yeni yayın" };

export default async function NewPublicationPage() {
  await requireUser({ permission: "publication:manage" });
  const options = await getFormOptions();
  return (
    <>
      <PageHeader title="Yeni yayın" description="Önce taslak olarak kaydedebilir, hazır olduğunda yayınlayabilirsiniz." />
      <PublicationForm
        id={null}
        action={savePublication}
        categories={options.categories}
        authors={options.authors}
        areas={options.areas}
        values={{
          title: "",
          slug: "",
          excerpt: "",
          content: "",
          categoryId: "",
          tags: "",
          authorId: "",
          authorName: "",
          featured: false,
          publishedAt: "",
          seoTitle: "",
          seoDescription: "",
          areaIds: [],
          cover: null,
          ogImage: null,
          status: "DRAFT",
        }}
      />
    </>
  );
}
