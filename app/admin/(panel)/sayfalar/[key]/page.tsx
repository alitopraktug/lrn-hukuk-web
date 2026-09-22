import Link from "next/link";
import { notFound } from "next/navigation";
import { RichPageForm, StructuredPageForm } from "@/app/admin/(panel)/sayfalar/page-forms";
import { saveRichPage, saveStructuredPage } from "@/app/admin/(panel)/sayfalar/actions";
import { PageHeader, btnClass } from "@/components/admin/ui";
import { getPickedMedia } from "@/lib/admin/queries";
import { ABOUT_FIELDS, HOME_FIELDS, PAGE_META, isPageKey } from "@/lib/content/defaults";
import { requireUser } from "@/lib/auth/guards";
import { getPage } from "@/lib/data/site";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Sayfayı düzenle" };

export default async function EditPageAdmin({ params }: { params: Promise<{ key: string }> }) {
  await requireUser({ permission: "page:manage" });
  const { key } = await params;
  if (!isPageKey(key)) notFound();
  const meta = PAGE_META[key];

  const page = await getPage(key);
  const row = await db.page.findUnique({ where: { key }, select: { data: true, ogImageId: true } });

  return (
    <>
      <PageHeader
        title={meta.title}
        description={meta.description}
        actions={
          <>
            <Link href="/admin/sayfalar" className={btnClass.secondary}>
              ← Sayfalar
            </Link>
            <Link href={meta.path} target="_blank" className={btnClass.secondary}>
              Sayfayı aç
            </Link>
          </>
        }
      />
      {meta.kind === "structured" ? (
        <StructuredPageForm
          pageKey={key}
          action={saveStructuredPage}
          fields={key === "home" ? HOME_FIELDS : ABOUT_FIELDS}
          // Yalnızca panelde girilmiş değerler gösterilir; boş alan varsayılan metne döner (placeholder olarak görünmez, bilgi metninde belirtilir).
          values={{ ...page.data, ...((row?.data ?? {}) as Record<string, string>) }}
          seoTitle={page.seoTitle ?? ""}
          seoDescription={page.seoDescription ?? ""}
          ogImage={await getPickedMedia(row?.ogImageId)}
        />
      ) : (
        <RichPageForm
          pageKey={key}
          action={saveRichPage}
          title={page.title}
          content={page.content}
          seoTitle={page.seoTitle ?? ""}
          seoDescription={page.seoDescription ?? ""}
          reviewedAt={page.reviewedAt ? formatDate(page.reviewedAt) : null}
        />
      )}
    </>
  );
}
