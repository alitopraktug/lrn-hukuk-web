"use client";

import { ExternalLink, Eye } from "lucide-react";
import Link from "next/link";
import { SlugField, SubmitButton } from "@/components/admin/client";
import { ImageField, type PickedMedia } from "@/components/admin/image-field";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { Alert, Card, Checkbox, Field, Select, StatusBadge, TextArea, TextInput, btnClass } from "@/components/admin/ui";
import { useServerForm } from "@/components/admin/use-server-form";
import type { ActionState } from "@/lib/actions";

export type PublicationFormValues = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  categoryId: string;
  tags: string;
  authorId: string;
  authorName: string;
  featured: boolean;
  publishedAt: string;
  seoTitle: string;
  seoDescription: string;
  areaIds: string[];
  cover: PickedMedia | null;
  ogImage: PickedMedia | null;
  status: "DRAFT" | "PUBLISHED";
};

export function PublicationForm({
  id,
  values,
  categories,
  authors,
  areas,
  action,
  saved,
}: {
  id: string | null;
  values: PublicationFormValues;
  categories: { id: string; name: string }[];
  authors: { id: string; fullName: string }[];
  areas: { id: string; title: string }[];
  action: (id: string | null, prev: ActionState, formData: FormData) => Promise<ActionState>;
  saved?: boolean;
}) {
  const { state, pending, intent, onSubmit } = useServerForm(action.bind(null, id));
  const e = state.fieldErrors ?? {};
  const published = values.status === "PUBLISHED";

  return (
    <form onSubmit={onSubmit} noValidate>
      {/* Yapışkan işlem çubuğu — kaydet düğmeleri her zaman görünür */}
      <div className="sticky top-14 z-20 -mx-4 mb-6 flex flex-wrap items-center gap-2 border-b border-line bg-admin/95 px-4 py-3 backdrop-blur sm:-mx-8 sm:px-8 lg:top-0">
        <StatusBadge status={values.status} publishedAt={values.publishedAt ? new Date(`${values.publishedAt}:00+03:00`) : null} />
        <div className="ml-auto flex flex-wrap items-center gap-2">
          {published ? (
            <>
              <SubmitButton name="intent" value="publish" pending={pending} activeIntent={intent}>
                Güncelle
              </SubmitButton>
              <SubmitButton name="intent" value="unpublish" variant="secondary" pending={pending} activeIntent={intent} pendingLabel="İşleniyor…">
                Taslağa al
              </SubmitButton>
            </>
          ) : (
            <>
              <SubmitButton name="intent" value="draft" variant="secondary" pending={pending} activeIntent={intent}>
                Taslak olarak kaydet
              </SubmitButton>
              <SubmitButton name="intent" value="publish" pending={pending} activeIntent={intent} pendingLabel="Yayınlanıyor…">
                Yayınla
              </SubmitButton>
            </>
          )}
          {id ? (
            <Link href={`/admin/yayinlar/${id}/onizleme`} target="_blank" className={btnClass.secondary}>
              <Eye size={16} aria-hidden="true" />
              Önizle
            </Link>
          ) : null}
          {id && published ? (
            <Link href={`/yayinlar/${values.slug}`} target="_blank" className={btnClass.ghost}>
              <ExternalLink size={16} aria-hidden="true" />
              Sayfayı aç
            </Link>
          ) : null}
        </div>
      </div>

      {saved && state.status === "idle" ? <Alert tone="success" className="mb-6">Yayın oluşturuldu. Aşağıdan düzenlemeye devam edebilirsiniz.</Alert> : null}
      {state.status !== "idle" && state.message ? (
        <Alert tone={state.status === "success" ? "success" : "error"} className="mb-6">
          {state.message}
        </Alert>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_21rem]">
        <div className="space-y-6">
          <Card title="İçerik">
            <div className="space-y-5">
              <Field label="Başlık" name="title" required error={e.title}>
                <TextInput name="title" defaultValue={values.title} maxLength={160} error={e.title} autoComplete="off" />
              </Field>
              <Field label="Adres (slug)" name="slug" error={e.slug} hint={<>Sitedeki adres: <code>/yayinlar/{values.slug || "baslik-ornegi"}</code>. Boş bırakırsanız başlıktan üretilir.</>}>
                <SlugField defaultValue={values.slug} editing={Boolean(id)} error={e.slug} />
              </Field>
              <Field label="Kısa açıklama (özet)" name="excerpt" error={e.excerpt} hint="Yayın kartlarında ve arama sonuçlarında görünür. En fazla 320 karakter.">
                <TextArea name="excerpt" rows={3} defaultValue={values.excerpt} maxLength={320} error={e.excerpt} />
              </Field>
              <div>
                <p className="mb-1.5 text-[0.85rem] font-semibold">Metin</p>
                <RichTextEditor name="content" defaultValue={values.content} error={e.content} placeholder="Yayının metnini buraya yazın. Başlıklar için H2/H3 düğmelerini kullanın." />
                {e.content ? <p className="mt-1.5 text-[0.85rem] font-medium text-danger">{e.content}</p> : null}
              </div>
            </div>
          </Card>
        </div>

        <aside className="space-y-6">
          <Card title="Yayın tarihi">
            <Field label="Tarih ve saat" name="publishedAt" error={e.publishedAt} hint="Boş bırakırsanız yayınlandığı an kullanılır. İleri bir tarih girerseniz yayın o tarihte görünür hâle gelir.">
              <TextInput name="publishedAt" type="datetime-local" defaultValue={values.publishedAt} error={e.publishedAt} />
            </Field>
          </Card>

          <Card title="Sınıflandırma">
            <div className="space-y-5">
              <Field label="Kategori" name="categoryId">
                <Select name="categoryId" defaultValue={values.categoryId}>
                  <option value="">Kategori yok</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Etiketler" name="tags" error={e.tags} hint="Virgülle ayırın (en fazla 10).">
                <TextInput name="tags" defaultValue={values.tags} maxLength={400} error={e.tags} />
              </Field>
              <Field label="Yazar" name="authorId" hint="Ekip üyesi seçerseniz yazı adı profil sayfasına bağlanır.">
                <Select name="authorId" defaultValue={values.authorId}>
                  <option value="">Büro adına (LRN Hukuk)</option>
                  {authors.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.fullName}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Yazar adı (isteğe bağlı)" name="authorName" hint="Ekip üyesi seçilmediyse görünecek ad.">
                <TextInput name="authorName" defaultValue={values.authorName} maxLength={100} />
              </Field>
              <Checkbox name="featured" label="Öne çıkar" hint="Ana sayfada listenin başında yer alır." defaultChecked={values.featured} />
            </div>
          </Card>

          {areas.length ? (
            <Card title="İlgili çalışma alanları" description="Seçilen alanların sayfasında bu yayın 'İlgili Yayınlar' bölümünde görünür.">
              <div className="space-y-2.5">
                {areas.map((a) => (
                  <Checkbox key={a.id} id={`area-${a.id}`} name="areaIds" value={a.id} label={a.title} defaultChecked={values.areaIds.includes(a.id)} />
                ))}
              </div>
            </Card>
          ) : null}

          <Card title="Kapak görseli">
            <ImageField name="coverId" label="Yayın görseli" purpose="COVER" initial={values.cover} aspect="aspect-[16/10]" hint="İsteğe bağlı. Yatay (16:9) görseller önerilir." error={e.coverId} />
          </Card>

          <Card title="Arama motoru (SEO)" description="Boş bırakılan alanlar için başlık ve özet kullanılır.">
            <div className="space-y-5">
              <Field label="SEO başlığı" name="seoTitle" error={e.seoTitle} hint="En fazla 70 karakter.">
                <TextInput name="seoTitle" defaultValue={values.seoTitle} maxLength={70} error={e.seoTitle} />
              </Field>
              <Field label="SEO açıklaması" name="seoDescription" error={e.seoDescription} hint="En fazla 170 karakter. Tanıtım/iddia içeren ifadelerden kaçının.">
                <TextArea name="seoDescription" rows={3} defaultValue={values.seoDescription} maxLength={170} error={e.seoDescription} />
              </Field>
              <ImageField name="ogImageId" label="Paylaşım görseli (OG)" purpose="OG" initial={values.ogImage} aspect="aspect-[1200/630]" hint="Sosyal medyada paylaşıldığında görünür. Boşsa kapak veya varsayılan görsel kullanılır." />
            </div>
          </Card>
        </aside>
      </div>
    </form>
  );
}
