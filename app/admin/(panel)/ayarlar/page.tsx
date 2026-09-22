import { SettingsForm } from "@/app/admin/(panel)/ayarlar/settings-form";
import { saveSettings } from "@/app/admin/(panel)/ayarlar/actions";
import { PageHeader } from "@/components/admin/ui";
import { getPickedMedia } from "@/lib/admin/queries";
import { requireUser } from "@/lib/auth/guards";
import { env } from "@/lib/env";
import { db } from "@/lib/db";
import { isEmailConfigured } from "@/lib/email";

export const metadata = { title: "Site ayarları" };

export default async function SettingsPage() {
  await requireUser({ permission: "settings:manage" });
  // Ham satır okunur (ortam değişkeni geri dönüşleri forma karışmasın diye getSiteSettings kullanılmaz).
  const row = await db.siteSetting.findUnique({ where: { id: "site" } });
  const [logo, favicon] = await Promise.all([getPickedMedia(row?.logoId), getPickedMedia(row?.faviconId)]);

  return (
    <>
      <PageHeader title="Site ayarları" description="İletişim bilgileri, alt bilgi, sosyal bağlantılar, logo ve iletişim formu ayarları." />
      <SettingsForm
        action={saveSettings}
        envFallbacks={{ smtp: isEmailConfigured(), recipient: Boolean(env.contactToEmail) }}
        values={{
          firmName: row?.firmName ?? "LRN Hukuk",
          phone: row?.phone ?? "",
          email: row?.email ?? "",
          address: row?.address ?? "",
          mapEmbedUrl: row?.mapEmbedUrl ?? "",
          workingHours: row?.workingHours ?? "",
          linkedin: row?.linkedin ?? "",
          instagram: row?.instagram ?? "",
          x: row?.x ?? "",
          facebook: row?.facebook ?? "",
          footerText: row?.footerText ?? "",
          publicationDisclaimer: row?.publicationDisclaimer ?? "",
          contactNotice: row?.contactNotice ?? "",
          contactConsentLabel: row?.contactConsentLabel ?? "",
          contactRecipientEmail: row?.contactRecipientEmail ?? "",
          storeContactMessages: row?.storeContactMessages ?? true,
          messageRetentionDays: row?.messageRetentionDays ?? 365,
          gaMeasurementId: row?.gaMeasurementId ?? "",
          logo,
          favicon,
        }}
      />
    </>
  );
}
