"use server";

import { z } from "zod";
import { audit } from "@/lib/audit";
import { errorState, formToObject, parseForm, successState, zodFieldErrors, type ActionState } from "@/lib/actions";
import { guard } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { existingMediaId, revalidateSite, syncMediaAlt } from "@/lib/admin/helpers";
import { ABOUT_FIELDS, HOME_FIELDS, PAGE_META, isPageKey, type FieldDef } from "@/lib/content/defaults";
import { sanitizeRichText } from "@/lib/richtext";
import { multiLine, singleLine } from "@/lib/text";
import { richPageSchema } from "@/lib/validation/admin";

const PERM = "page:manage" as const;

function structuredSchema(fields: FieldDef[]) {
  const shape: Record<string, z.ZodType> = {
    seoTitle: z.string().optional().default("").transform(singleLine).pipe(z.string().max(70, "SEO başlığı en fazla 70 karakter olabilir.")),
    seoDescription: z.string().optional().default("").transform(multiLine).pipe(z.string().max(170, "SEO açıklaması en fazla 170 karakter olabilir.")),
    ogImageId: z.string().optional().default(""),
    ogImageIdAlt: z.string().optional().default(""),
  };
  for (const f of fields) {
    shape[f.name] = z
      .string()
      .optional()
      .default("")
      .transform(f.type === "textarea" ? multiLine : singleLine)
      .pipe(z.string().max(f.max, `${f.label}: en fazla ${f.max} karakter olabilir.`));
  }
  return z.object(shape);
}

/** Ana Sayfa ve Hakkımızda gibi yapılandırılmış sayfaların metinleri. Boş bırakılan alan varsayılan metne döner. */
export async function saveStructuredPage(key: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const g = await guard(PERM);
  if (!g.ok) return g.state;
  if (!isPageKey(key) || (key !== "home" && key !== "about")) return errorState("Geçersiz sayfa.");

  const fields = key === "home" ? HOME_FIELDS : ABOUT_FIELDS;
  const result = structuredSchema(fields).safeParse(formToObject(formData));
  if (!result.success) return { status: "error", message: "Lütfen işaretli alanları kontrol edin.", fieldErrors: zodFieldErrors(result.error) };
  const v = result.data as Record<string, string>;

  const data: Record<string, string> = {};
  for (const f of fields) if (v[f.name]) data[f.name] = v[f.name];

  const ogImageId = await existingMediaId(v.ogImageId || null);
  await db.page.upsert({
    where: { key },
    update: { data, seoTitle: v.seoTitle || null, seoDescription: v.seoDescription || null, ogImageId, updatedById: g.user.id },
    create: { key, title: PAGE_META[key].title, data, seoTitle: v.seoTitle || null, seoDescription: v.seoDescription || null, ogImageId, updatedById: g.user.id },
  });
  await syncMediaAlt(ogImageId, v.ogImageIdAlt);
  await audit({ user: g.user, action: "page.updated", entity: "Page", entityId: key });
  revalidateSite();
  return successState("Sayfa kaydedildi.");
}

/** KVKK, çerez, gizlilik, kullanım koşulları: zengin metin + "hukukçu onayı" işareti. */
export async function saveRichPage(key: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const g = await guard(PERM);
  if (!g.ok) return g.state;
  if (!isPageKey(key) || PAGE_META[key].kind !== "richtext") return errorState("Geçersiz sayfa.");

  const parsed = parseForm(richPageSchema, formData);
  if (!parsed.ok) return parsed.state;
  const d = parsed.data;

  const existing = await db.page.findUnique({ where: { key }, select: { reviewedAt: true } });
  // Onay kutusu işaretliyse ilk işaretlenişte tarih atanır; işaret kaldırılırsa onay sıfırlanır.
  const reviewedAt = d.reviewed ? (existing?.reviewedAt ?? new Date()) : null;
  const content = sanitizeRichText(d.content);

  await db.page.upsert({
    where: { key },
    update: { title: d.title, content, seoTitle: d.seoTitle, seoDescription: d.seoDescription, reviewedAt, updatedById: g.user.id },
    create: { key, title: d.title, content, seoTitle: d.seoTitle, seoDescription: d.seoDescription, reviewedAt, updatedById: g.user.id },
  });
  await audit({ user: g.user, action: "page.updated", entity: "Page", entityId: key, meta: { reviewed: Boolean(reviewedAt) } });
  revalidateSite();
  return successState(reviewedAt ? "Sayfa kaydedildi ve hukukçu onaylı olarak işaretlendi." : "Sayfa kaydedildi.");
}
