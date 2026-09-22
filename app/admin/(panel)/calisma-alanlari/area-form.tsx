"use client";

import { ExternalLink, Eye } from "lucide-react";
import Link from "next/link";
import { SlugField, SubmitButton } from "@/components/admin/client";
import { ImageField, type PickedMedia } from "@/components/admin/image-field";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { Alert, Card, Checkbox, Field, StatusBadge, TextArea, TextInput, btnClass } from "@/components/admin/ui";
import { useServerForm } from "@/components/admin/use-server-form";
import type { ActionState } from "@/lib/actions";

export type AreaFormValues = {
  title: string;
  slug: string;
  shortDescription: string;
  content: string;
  topics: string;
  seoTitle: string;
  seoDescription: string;
  teamIds: string[];
  publicationIds: string[];
  cover: PickedMedia | null;
  ogImage: PickedMedia | null;
  status: "DRAFT" | "PUBLISHED";
};

export function AreaForm({
  id,
  values,
  team,
  publications,
  action,
  saved,
}: {
  id: string | null;
  values: AreaFormValues;
  team: { id: string; fullName: string; title: string }[];
  publications: { id: string; title: string }[];
  action: (id: string | null, prev: ActionState, formData: FormData) => Promise<ActionState>;
  saved?: boolean;
}) {
  const { state, pending, intent, onSubmit } = useServerForm(action.bind(null, id));
  const e = state.fieldErrors ?? {};
  const published = values.status === "PUBLISHED";

  return (
    <form onSubmit={onSubmit} noValidate>
      <div className="sticky top-14 z-20 -mx-4 mb-6 flex flex-wrap items-center gap-2 border-b border-line bg-admin/95 px-4 py-3 backdrop-blur sm:-mx-8 sm:px-8 lg:top-0">
        <StatusBadge status={values.status} />
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
            <Link href={`/admin/calisma-alanlari/${id}/onizleme`} target="_blank" className={btnClass.secondary}>
              <Eye size={16} aria-hidden="true" />
              Önizle
            </Link>
          ) : null}
          {id && published ? (
            <Link href={`/calisma-alanlari/${values.slug}`} target="_blank" className={btnClass.ghost}>
              <ExternalLink size={16} aria-hidden="true" />
              Sayfayı aç
            </Link>
          ) : null}
        </div>
      </div>

      {saved && state.status === "idle" ? <Alert tone="success" className="mb-6">Çalışma alanı oluşturuldu. Aşağıdan düzenlemeye devam edebilirsiniz.</Alert> : null}
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
                <TextInput name="title" defaultValue={values.title} maxLength={120} error={e.title} autoComplete="off" />
              </Field>
              <Field label="Adres (slug)" name="slug" error={e.slug} hint={<>Sitedeki adres: <code>/calisma-alanlari/{values.slug || "alan-adi"}</code></>}>
                <SlugField defaultValue={values.slug} editing={Boolean(id)} error={e.slug} />
              </Field>
              <Field label="Kısa açıklama" name="shortDescription" error={e.shortDescription} hint="Liste ve kartlarda görünür. En fazla 300 karakter.">
                <TextArea name="shortDescription" rows={3} defaultValue={values.shortDescription} maxLength={300} error={e.shortDescription} />
              </Field>
              <Field label="Başlıca konu başlıkları" name="topics" error={e.topics} hint="Her satıra bir başlık yazın (en fazla 14). Sayfanın üst kısmında liste olarak görünür.">
                <TextArea name="topics" rows={6} defaultValue={values.topics} error={e.topics} />
              </Field>
              <div>
                <p className="mb-1.5 text-[0.85rem] font-semibold">Ayrıntılı içerik</p>
                <RichTextEditor name="content" defaultValue={values.content} error={e.content} placeholder="Çalışma alanını açıklayan metni yazın. Tanıtım/iddia içeren ifadelerden kaçının." />
              </div>
            </div>
          </Card>
        </div>

        <aside className="space-y-6">
          <Card title="Kapak görseli">
            <ImageField name="coverId" label="Görsel" purpose="COVER" initial={values.cover} aspect="aspect-[16/8]" hint="İsteğe bağlı. Klişe hukuk görsellerinden (terazi, tokmak) kaçının; mimari/soyut görseller tercih edin." />
          </Card>

          <Card title="Bu alanda çalışan avukatlar">
            {team.length ? (
              <div className="space-y-2.5">
                {team.map((m) => (
                  <Checkbox key={m.id} id={`team-${m.id}`} name="teamIds" value={m.id} label={m.fullName} hint={m.title} defaultChecked={values.teamIds.includes(m.id)} />
                ))}
              </div>
            ) : (
              <p className="text-[0.9rem] text-quiet">Henüz ekip üyesi yok.</p>
            )}
          </Card>

          {publications.length ? (
            <Card title="İlgili yayınlar" description="Seçilenler bu alanın sayfasında 'İlgili Yayınlar' olarak görünür.">
              <div className="max-h-72 space-y-2.5 overflow-y-auto pr-1">
                {publications.map((p) => (
                  <Checkbox key={p.id} id={`pub-${p.id}`} name="publicationIds" value={p.id} label={p.title} defaultChecked={values.publicationIds.includes(p.id)} />
                ))}
              </div>
            </Card>
          ) : null}

          <Card title="Arama motoru (SEO)" description="Boş bırakılan alanlar için başlık ve kısa açıklama kullanılır.">
            <div className="space-y-5">
              <Field label="SEO başlığı" name="seoTitle" error={e.seoTitle} hint="En fazla 70 karakter.">
                <TextInput name="seoTitle" defaultValue={values.seoTitle} maxLength={70} error={e.seoTitle} />
              </Field>
              <Field label="SEO açıklaması" name="seoDescription" error={e.seoDescription} hint="En fazla 170 karakter. “En iyi”, “garantili” gibi iddialardan kaçının.">
                <TextArea name="seoDescription" rows={3} defaultValue={values.seoDescription} maxLength={170} error={e.seoDescription} />
              </Field>
              <ImageField name="ogImageId" label="Paylaşım görseli (OG)" purpose="OG" initial={values.ogImage} aspect="aspect-[1200/630]" />
            </div>
          </Card>
        </aside>
      </div>
    </form>
  );
}
