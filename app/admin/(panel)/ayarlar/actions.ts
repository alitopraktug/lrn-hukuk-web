"use server";

import { audit } from "@/lib/audit";
import { parseForm, successState, type ActionState } from "@/lib/actions";
import { guard } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { existingMediaId, revalidateSite, syncMediaAlt } from "@/lib/admin/helpers";
import { seoSchema, settingsSchema } from "@/lib/validation/admin";

/** Site ayarları (tek satır, id = "site"). Yalnızca yönetici (ADMIN). */
export async function saveSettings(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const g = await guard("settings:manage");
  if (!g.ok) return g.state;

  const parsed = parseForm(settingsSchema, formData);
  if (!parsed.ok) return parsed.state;
  const d = parsed.data;

  const [logoId, faviconId] = await Promise.all([existingMediaId(d.logoId), existingMediaId(d.faviconId)]);
  const data = {
    firmName: d.firmName,
    phone: d.phone,
    email: d.email ?? "",
    address: d.address,
    mapEmbedUrl: d.mapEmbedUrl,
    workingHours: d.workingHours,
    linkedin: d.linkedin,
    instagram: d.instagram,
    x: d.x,
    facebook: d.facebook,
    footerText: d.footerText,
    publicationDisclaimer: d.publicationDisclaimer,
    contactNotice: d.contactNotice,
    contactConsentLabel: d.contactConsentLabel,
    contactRecipientEmail: d.contactRecipientEmail ?? "",
    storeContactMessages: d.storeContactMessages,
    messageRetentionDays: d.messageRetentionDays,
    gaMeasurementId: d.gaMeasurementId,
    logoId,
    faviconId,
    updatedById: g.user.id,
  };
  await db.siteSetting.upsert({ where: { id: "site" }, update: data, create: { id: "site", ...data } });
  await Promise.all([syncMediaAlt(logoId, d.logoIdAlt), syncMediaAlt(faviconId, d.faviconIdAlt)]);
  await audit({ user: g.user, action: "settings.updated", entity: "SiteSetting", entityId: "site" });
  revalidateSite();
  return successState("Ayarlar kaydedildi.");
}

/** Varsayılan SEO ayarları ve Search Console doğrulama kodu. */
export async function saveSeo(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const g = await guard("seo:manage");
  if (!g.ok) return g.state;

  const parsed = parseForm(seoSchema, formData);
  if (!parsed.ok) return parsed.state;
  const d = parsed.data;

  const ogImageId = await existingMediaId(d.ogImageId);
  const data = {
    defaultTitle: d.defaultTitle,
    defaultDescription: d.defaultDescription,
    googleSiteVerification: d.googleSiteVerification,
    ogImageId,
    updatedById: g.user.id,
  };
  await db.siteSetting.upsert({ where: { id: "site" }, update: data, create: { id: "site", ...data } });
  await syncMediaAlt(ogImageId, d.ogImageIdAlt);
  await audit({ user: g.user, action: "seo.updated", entity: "SiteSetting", entityId: "site" });
  revalidateSite();
  return successState("SEO ayarları kaydedildi.");
}
