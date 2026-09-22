"use client";

import { SubmitButton } from "@/components/admin/client";
import { ImageField, type PickedMedia } from "@/components/admin/image-field";
import { Card, Field, FormFeedback, TextArea, TextInput } from "@/components/admin/ui";
import { useServerForm } from "@/components/admin/use-server-form";
import type { ActionState } from "@/lib/actions";

export function SeoForm({
  action,
  values,
}: {
  action: (prev: ActionState, fd: FormData) => Promise<ActionState>;
  values: { defaultTitle: string; defaultDescription: string; googleSiteVerification: string; ogImage: PickedMedia | null };
}) {
  const { state, pending, onSubmit } = useServerForm(action);
  const e = state.fieldErrors ?? {};
  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      <FormFeedback state={state} />
      <Card title="Varsayılan arama sonucu görünümü" description="Kendi SEO alanı boş olan sayfalar bu değerleri kullanır.">
        <div className="space-y-5">
          <Field label="Varsayılan site başlığı" name="defaultTitle" required error={e.defaultTitle} hint="Örn. “LRN Hukuk | Ankara”. En fazla 70 karakter. Tanıtım/iddia içeren ifadelerden (“en iyi”, “garantili” vb.) kaçının.">
            <TextInput name="defaultTitle" defaultValue={values.defaultTitle} maxLength={70} error={e.defaultTitle} />
          </Field>
          <Field label="Varsayılan açıklama" name="defaultDescription" error={e.defaultDescription} hint="En fazla 170 karakter.">
            <TextArea name="defaultDescription" rows={3} defaultValue={values.defaultDescription} maxLength={170} error={e.defaultDescription} />
          </Field>
          <ImageField name="ogImageId" label="Varsayılan paylaşım görseli (OG)" purpose="OG" initial={values.ogImage} aspect="aspect-[1200/630]" hint="Sayfa kendi görselini belirtmediğinde sosyal medya paylaşımlarında görünür. Boşsa kurumsal varsayılan görsel kullanılır." />
        </div>
      </Card>
      <Card title="Google Search Console" description="Search Console'da 'HTML etiketi' ile doğrulama seçeneğindeki content değerini buraya yapıştırın.">
        <Field label="Doğrulama kodu" name="googleSiteVerification" error={e.googleSiteVerification} hint="<meta name='google-site-verification' content='…'> içindeki content değeri.">
          <TextInput name="googleSiteVerification" defaultValue={values.googleSiteVerification} maxLength={100} error={e.googleSiteVerification} autoComplete="off" />
        </Field>
      </Card>
      <SubmitButton pending={pending} activeIntent={null}>
        SEO ayarlarını kaydet
      </SubmitButton>
    </form>
  );
}
