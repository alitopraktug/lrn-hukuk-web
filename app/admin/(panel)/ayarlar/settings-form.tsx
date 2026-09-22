"use client";

import { SubmitButton } from "@/components/admin/client";
import { ImageField, type PickedMedia } from "@/components/admin/image-field";
import { Card, Checkbox, Field, FormFeedback, TextArea, TextInput } from "@/components/admin/ui";
import { useServerForm } from "@/components/admin/use-server-form";
import type { ActionState } from "@/lib/actions";

export type SettingsValues = {
  firmName: string;
  phone: string;
  email: string;
  address: string;
  mapEmbedUrl: string;
  workingHours: string;
  linkedin: string;
  instagram: string;
  x: string;
  facebook: string;
  footerText: string;
  publicationDisclaimer: string;
  contactNotice: string;
  contactConsentLabel: string;
  contactRecipientEmail: string;
  storeContactMessages: boolean;
  messageRetentionDays: number;
  gaMeasurementId: string;
  logo: PickedMedia | null;
  favicon: PickedMedia | null;
};

export function SettingsForm({ values, action, envFallbacks }: { values: SettingsValues; action: (prev: ActionState, fd: FormData) => Promise<ActionState>; envFallbacks: { smtp: boolean; recipient: boolean } }) {
  const { state, pending, onSubmit } = useServerForm(action);
  const e = state.fieldErrors ?? {};
  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      <div className="sticky top-14 z-20 -mx-4 flex items-center justify-between gap-3 border-b border-line bg-admin/95 px-4 py-3 backdrop-blur sm:-mx-8 sm:px-8 lg:top-0">
        <p className="text-[0.85rem] text-quiet">Değişiklikler kaydedildiğinde sitede hemen yansır.</p>
        <SubmitButton pending={pending} activeIntent={null}>
          Ayarları kaydet
        </SubmitButton>
      </div>
      <FormFeedback state={state} />

      <Card title="Büro bilgileri" description="Sitede uydurma bilgi gösterilmez; yalnızca burada girdiğiniz bilgiler yayınlanır.">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Büro adı" name="firmName" required error={e.firmName}>
            <TextInput name="firmName" defaultValue={values.firmName} maxLength={80} error={e.firmName} />
          </Field>
          <Field label="E-posta" name="email" error={e.email}>
            <TextInput name="email" type="email" defaultValue={values.email} maxLength={200} error={e.email} autoComplete="off" />
          </Field>
          <Field label="Telefon" name="phone" error={e.phone}>
            <TextInput name="phone" type="tel" defaultValue={values.phone} maxLength={40} error={e.phone} autoComplete="off" />
          </Field>
          <Field label="Çalışma saatleri" name="workingHours" error={e.workingHours} hint="Örn. “Hafta içi 09.00–18.00”. Satır sonları korunur.">
            <TextArea name="workingHours" rows={2} defaultValue={values.workingHours} maxLength={300} error={e.workingHours} />
          </Field>
          <Field className="sm:col-span-2" label="Adres" name="address" error={e.address} hint="Satır sonları korunur. İletişim sayfasında, alt bilgide ve yapılandırılmış veride kullanılır.">
            <TextArea name="address" rows={3} defaultValue={values.address} maxLength={400} error={e.address} />
          </Field>
          <Field className="sm:col-span-2" label="Harita gömme adresi" name="mapEmbedUrl" error={e.mapEmbedUrl} hint="Google Haritalar → Paylaş → Haritayı yerleştir → iframe içindeki src adresini yapıştırın. Harita, ziyaretçi “Haritayı yükle”ye basana kadar yüklenmez.">
            <TextInput name="mapEmbedUrl" type="url" defaultValue={values.mapEmbedUrl} maxLength={1200} error={e.mapEmbedUrl} />
          </Field>
        </div>
      </Card>

      <Card title="Logo ve simge">
        <div className="grid gap-8 md:grid-cols-2">
          <ImageField name="logoId" label="Logo (isteğe bağlı)" purpose="LOGO" initial={values.logo} aspect="aspect-[3/1]" hint="Boş bırakırsanız /public/brand içindeki logo kullanılır. PNG, WebP veya SVG; şeffaf arka plan önerilir." />
          <ImageField name="faviconId" label="Favicon (isteğe bağlı)" purpose="FAVICON" initial={values.favicon} aspect="aspect-square" hint="Kare (512×512) PNG veya SVG. Boşsa varsayılan simge kullanılır." />
        </div>
      </Card>

      <Card title="Sosyal bağlantılar" description="Yalnızca doldurduklarınız alt bilgide gösterilir.">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="LinkedIn" name="linkedin" error={e.linkedin}>
            <TextInput name="linkedin" type="url" defaultValue={values.linkedin} maxLength={300} error={e.linkedin} />
          </Field>
          <Field label="Instagram" name="instagram" error={e.instagram}>
            <TextInput name="instagram" type="url" defaultValue={values.instagram} maxLength={300} error={e.instagram} />
          </Field>
          <Field label="X (Twitter)" name="x" error={e.x}>
            <TextInput name="x" type="url" defaultValue={values.x} maxLength={300} error={e.x} />
          </Field>
          <Field label="Facebook" name="facebook" error={e.facebook}>
            <TextInput name="facebook" type="url" defaultValue={values.facebook} maxLength={300} error={e.facebook} />
          </Field>
        </div>
      </Card>

      <Card title="Metinler" description="Bu metinlerin meslek kurallarına uygunluğu LRN Hukuk tarafından ayrıca kontrol edilmelidir.">
        <div className="space-y-5">
          <Field label="Alt bilgi metni" name="footerText" error={e.footerText}>
            <TextArea name="footerText" rows={3} defaultValue={values.footerText} maxLength={400} error={e.footerText} />
          </Field>
          <Field label="Yayın bilgilendirme notu" name="publicationDisclaimer" error={e.publicationDisclaimer} hint="Makale ve çalışma alanı sayfalarının altında görünür.">
            <TextArea name="publicationDisclaimer" rows={3} defaultValue={values.publicationDisclaimer} maxLength={600} error={e.publicationDisclaimer} />
          </Field>
        </div>
      </Card>

      <Card title="İletişim formu" description="Kişisel veri minimizasyonu: formda yalnızca gerekli alanlar istenir.">
        <div className="space-y-5">
          <Field label="Form uyarı metni" name="contactNotice" error={e.contactNotice} hint="Formun altında, gönder düğmesinin üstünde görünür (özel nitelikli veri paylaşılmaması uyarısı gibi).">
            <TextArea name="contactNotice" rows={3} defaultValue={values.contactNotice} maxLength={600} error={e.contactNotice} />
          </Field>
          <Field label="Aydınlatma metni onay kutusu yazısı" name="contactConsentLabel" error={e.contactConsentLabel} hint={<>Bağlantı olacak kısmı çift süslü parantez içine alın: <code>{"{{KVKK Aydınlatma Metni}}"}</code> — bu kısım /kvkk sayfasına bağlanır.</>}>
            <TextArea name="contactConsentLabel" rows={2} defaultValue={values.contactConsentLabel} maxLength={400} error={e.contactConsentLabel} />
          </Field>
          <Field label="Mesajların gönderileceği e-posta" name="contactRecipientEmail" error={e.contactRecipientEmail} hint={envFallbacks.recipient ? "Boşsa sunucudaki CONTACT_TO_EMAIL kullanılır." : "SMTP ve gönderim adresi sunucu ortam değişkenlerinden (CONTACT_TO_EMAIL) da tanımlanabilir."}>
            <TextInput name="contactRecipientEmail" type="email" defaultValue={values.contactRecipientEmail} maxLength={200} error={e.contactRecipientEmail} autoComplete="off" />
          </Field>
          <Checkbox name="storeContactMessages" label="Mesajları panelde de sakla" hint="Kapalıysa mesajlar yalnızca e-posta ile iletilir ve veritabanına yazılmaz." defaultChecked={values.storeContactMessages} />
          <Field label="Mesaj saklama süresi (gün)" name="messageRetentionDays" error={e.messageRetentionDays} hint="Süre dolan mesajlar silinmek üzere işaretlenir; “İletişim mesajları” sayfasından veya bakım komutuyla silinir.">
            <TextInput name="messageRetentionDays" type="number" min={30} max={3650} defaultValue={values.messageRetentionDays} error={e.messageRetentionDays} className="max-w-40" />
          </Field>
          {!envFallbacks.smtp ? <p className="text-[0.85rem] text-danger">SMTP henüz yapılandırılmamış: e-posta bildirimi gönderilemez. Bkz. Sistem ve Yedekleme.</p> : null}
        </div>
      </Card>

      <Card title="Analitik" description="Google Analytics 4 yalnızca ziyaretçi çerez onayı verdikten sonra çalışır. Boş bırakırsanız hiçbir izleme kodu yüklenmez ve çerez banner'ı gösterilmez.">
        <Field label="Ölçüm kimliği" name="gaMeasurementId" error={e.gaMeasurementId} hint="Örn. G-ABC123XYZ">
          <TextInput name="gaMeasurementId" defaultValue={values.gaMeasurementId} maxLength={30} error={e.gaMeasurementId} className="max-w-xs uppercase" autoComplete="off" />
        </Field>
      </Card>
    </form>
  );
}
