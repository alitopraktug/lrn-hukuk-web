import Link from "next/link";
import { deleteCategory, saveCategory } from "@/app/admin/(panel)/yayinlar/actions";
import { ConfirmForm } from "@/components/admin/client";
import { Card, PageHeader, btnClass, inputClass } from "@/components/admin/ui";
import { requireUser } from "@/lib/auth/guards";
import { db } from "@/lib/db";

export const metadata = { title: "Yayın kategorileri" };

export default async function CategoriesPage() {
  await requireUser({ permission: "publication:manage" });
  const [cats, areas] = await Promise.all([
    db.category.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }], include: { _count: { select: { publications: true } } } }),
    db.practiceArea.findMany({ where: { deletedAt: null }, orderBy: { sortOrder: "asc" }, select: { id: true, title: true } }),
  ]);

  return (
    <>
      <PageHeader
        title="Yayın kategorileri"
        description="Kategoriler yayın filtrelerinde görünür. Bir kategoriyi çalışma alanına bağlarsanız, o alanın sayfasında kategorideki yayınlar 'İlgili Yayınlar' olarak listelenir."
        actions={
          <Link href="/admin/yayinlar" className={btnClass.secondary}>
            ← Yayınlar
          </Link>
        }
      />
      <div className="space-y-4">
        {cats.map((c) => (
          <Card key={c.id}>
            <form action={saveCategory} className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
              <input type="hidden" name="id" value={c.id} />
              <div>
                <label htmlFor={`n-${c.id}`} className="mb-1.5 block text-[0.85rem] font-semibold">
                  Kategori adı
                </label>
                <input name="name" id={`n-${c.id}`} defaultValue={c.name} maxLength={80} required className={inputClass} />
              </div>
              <div>
                <label htmlFor={`a-${c.id}`} className="mb-1.5 block text-[0.85rem] font-semibold">
                  Bağlı çalışma alanı
                </label>
                <select name="practiceAreaId" id={`a-${c.id}`} defaultValue={c.practiceAreaId ?? ""} className={inputClass}>
                  <option value="">Bağlı değil</option>
                  {areas.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <button className={btnClass.secondary}>Kaydet</button>
              </div>
            </form>
            <div className="mt-3 flex items-center justify-between border-t border-line pt-3 text-[0.85rem] text-quiet">
              <span>
                {c._count.publications} yayın · adres: <code>{c.slug}</code>
              </span>
              <ConfirmForm action={deleteCategory} hidden={{ id: c.id }} title="Kategori silinsin mi?" message="Kategori silinir; bu kategorideki yayınlar silinmez, yalnızca kategorisiz kalır.">
                Sil
              </ConfirmForm>
            </div>
          </Card>
        ))}

        <Card title="Yeni kategori">
          <form action={saveCategory} className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
            <div>
              <label htmlFor="new-name" className="mb-1.5 block text-[0.85rem] font-semibold">
                Kategori adı
              </label>
              <input name="name" id="new-name" maxLength={80} required className={inputClass} />
            </div>
            <div>
              <label htmlFor="new-area" className="mb-1.5 block text-[0.85rem] font-semibold">
                Bağlı çalışma alanı
              </label>
              <select name="practiceAreaId" id="new-area" defaultValue="" className={inputClass}>
                <option value="">Bağlı değil</option>
                {areas.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.title}
                  </option>
                ))}
              </select>
            </div>
            <button className={btnClass.primary}>Ekle</button>
          </form>
        </Card>
      </div>
    </>
  );
}
