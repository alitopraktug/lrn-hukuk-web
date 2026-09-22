"use client";

import { SubmitButton } from "@/components/admin/client";
import { ImageField, type PickedMedia } from "@/components/admin/image-field";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { Alert, Card, Checkbox, Field, FormFeedback, TextArea, TextInput } from "@/components/admin/ui";
import { useServerForm } from "@/components/admin/use-server-form";
import type { ActionState } from "@/lib/actions";
import type { FieldDef } from "@/lib/content/defaults";

type Action = (key: string, prev: ActionState, formData: FormData) => Promise<ActionState>;

function SeoFields({ seoTitle, seoDescription, ogImage, errors }: { seoTitle: string; seoDescription: string; ogImage?: PickedMedia | null; errors: Record<string, string> }) {
  return (
    <Card title="Arama motoru (SEO)" description="Boş bırakılan alanlar için site varsayılanları kullanılır.">
      <div className="space-y-5">
        <Field label="SEO başlığı" name="seoTitle" error={errors.seoTitle} hint="En fazla 70 karakter.">
          <TextInput name="seoTitle" defaultValue={seoTitle} maxLength={70} error={errors.seoTitle} />
        </Field>
        <Field label="SEO açıklaması" name="seoDescription" error={errors.seoDescription} hint="En fazla 170 karakter.">
          <TextArea name="seoDescription" rows={3} defaultValue={seoDescription} maxLength={170} error={errors.seoDescription} />
        </Field>
        {ogImage !== undefined ? <ImageField name="ogImageId" label="Paylaşım görseli (OG)" purpose="OG" initial={ogImage} aspect="aspect-[1200/630]" /> : null}
      </div>
    </Card>
  );
}

export function StructuredPageForm({
  pageKey,
  action,
  fields,
  values,
  seoTitle,
  seoDescription,
  ogImage,
}: {
  pageKey: string;
  action: Action;
  fields: FieldDef[];
  values: Record<string, string>;
  seoTitle: string;
  seoDescription: string;
  ogImage: PickedMedia | null;
}) {
  const { state, pending, onSubmit } = useServerForm(action.bind(null, pageKey));
  const e = state.fieldErrors ?? {};
  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      <div className="sticky top-14 z-20 -mx-4 flex items-center justify-between gap-3 border-b border-line bg-admin/95 px-4 py-3 backdrop-blur sm:-mx-8 sm:px-8 lg:top-0">
        <p className="text-[0.85rem] text-quiet">Boş bıraktığınız alanlar varsayılan metne döner.</p>
        <SubmitButton pending={pending} activeIntent={null}>
          Kaydet
        </SubmitButton>
      </div>
      <FormFeedback state={state} />
      <Card title="Metinler">
        <div className="space-y-5">
          {fields.map((f) => (
            <Field key={f.name} label={f.label} name={f.name} error={e[f.name]} hint={f.hint}>
              {f.type === "textarea" ? (
                <TextArea name={f.name} rows={f.rows ?? 3} defaultValue={values[f.name] ?? ""} maxLength={f.max} error={e[f.name]} />
              ) : (
                <TextInput name={f.name} defaultValue={values[f.name] ?? ""} maxLength={f.max} error={e[f.name]} />
              )}
            </Field>
          ))}
        </div>
      </Card>
      <SeoFields seoTitle={seoTitle} seoDescription={seoDescription} ogImage={ogImage} errors={e} />
    </form>
  );
}

export function RichPageForm({
  pageKey,
  action,
  title,
  content,
  seoTitle,
  seoDescription,
  reviewedAt,
}: {
  pageKey: string;
  action: Action;
  title: string;
  content: string;
  seoTitle: string;
  seoDescription: string;
  reviewedAt: string | null;
}) {
  const { state, pending, onSubmit } = useServerForm(action.bind(null, pageKey));
  const e = state.fieldErrors ?? {};
  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      <div className="sticky top-14 z-20 -mx-4 flex items-center justify-between gap-3 border-b border-line bg-admin/95 px-4 py-3 backdrop-blur sm:-mx-8 sm:px-8 lg:top-0">
        <p className="text-[0.85rem] text-quiet">{reviewedAt ? `Hukukçu onayı: ${reviewedAt}` : "Henüz onaylanmadı"}</p>
        <SubmitButton pending={pending} activeIntent={null}>
          Kaydet
        </SubmitButton>
      </div>
      <Alert tone="warning">
        Bu metin <strong>yer tutucu</strong> olarak hazırlanmıştır ve hukuki tavsiye değildir. Yayına almadan önce LRN Hukuk&apos;un hukukçusu tarafından kontrol edilip tamamlanmalıdır; köşeli parantez içindeki [yer tutucuları] doldurun.
      </Alert>
      <FormFeedback state={state} />
      <Card title="Metin">
        <div className="space-y-5">
          <Field label="Sayfa başlığı" name="title" required error={e.title}>
            <TextInput name="title" defaultValue={title} maxLength={120} error={e.title} />
          </Field>
          <div>
            <p className="mb-1.5 text-[0.85rem] font-semibold">İçerik</p>
            <RichTextEditor name="content" defaultValue={content} error={e.content} minHeightClass="min-h-[26rem]" />
          </div>
          <Checkbox name="reviewed" label="Bu metin hukukçu tarafından kontrol edildi ve yayına hazır" hint="İşaretlediğinizde onay tarihi kaydedilir; ana paneldeki “Yayına hazırlık” listesinde tamamlandı görünür." defaultChecked={Boolean(reviewedAt)} />
        </div>
      </Card>
      <SeoFields seoTitle={seoTitle} seoDescription={seoDescription} errors={e} />
    </form>
  );
}
