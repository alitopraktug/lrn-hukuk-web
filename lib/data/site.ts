import "server-only";
import { cache } from "react";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import {
  ABOUT_DEFAULTS,
  DEFAULT_SETTINGS,
  HOME_DEFAULTS,
  LEGAL_DEFAULTS,
  PAGE_META,
  type PageKey,
} from "@/lib/content/defaults";
import { mediaRefSelect, type MediaRef } from "@/lib/data/types";

/**
 * Herkese açık okuma katmanı — site ayarları ve düzenlenebilir sayfalar.
 * Kayıt yoksa/alan boşsa kod içi varsayılanlar kullanılır; böylece site seed çalıştırılmadan da düzgün görünür.
 * Not: Veritabanı hatası YUTULMAZ. ISR sırasında hata oluşursa Next.js önceki başarılı sayfayı sunmaya devam eder.
 */
export type SiteSettingsView = {
  firmName: string;
  logo: MediaRef | null;
  favicon: MediaRef | null;
  ogImage: MediaRef | null;
  phone: string;
  email: string;
  address: string;
  mapEmbedUrl: string;
  workingHours: string;
  social: { linkedin: string; instagram: string; x: string; facebook: string };
  footerText: string;
  defaultTitle: string;
  defaultDescription: string;
  gaMeasurementId: string;
  googleSiteVerification: string;
  publicationDisclaimer: string;
  contactNotice: string;
  contactConsentLabel: string;
  contactRecipientEmail: string;
  storeContactMessages: boolean;
  messageRetentionDays: number;
};

const orDefault = (value: string | null | undefined, fallback: string) => (value && value.trim() ? value : fallback);

export const getSiteSettings = cache(async (): Promise<SiteSettingsView> => {
  const row = await db.siteSetting.findUnique({
    where: { id: "site" },
    include: {
      logo: { select: mediaRefSelect },
      favicon: { select: mediaRefSelect },
      ogImage: { select: mediaRefSelect },
    },
  });

  return {
    firmName: orDefault(row?.firmName, DEFAULT_SETTINGS.firmName),
    logo: row?.logo ?? null,
    favicon: row?.favicon ?? null,
    ogImage: row?.ogImage ?? null,
    phone: row?.phone ?? "",
    email: row?.email ?? "",
    address: row?.address ?? "",
    mapEmbedUrl: orDefault(row?.mapEmbedUrl, env.mapEmbedUrl ?? ""),
    workingHours: orDefault(row?.workingHours, DEFAULT_SETTINGS.workingHours),
    social: {
      linkedin: row?.linkedin ?? "",
      instagram: row?.instagram ?? "",
      x: row?.x ?? "",
      facebook: row?.facebook ?? "",
    },
    footerText: orDefault(row?.footerText, DEFAULT_SETTINGS.footerText),
    defaultTitle: orDefault(row?.defaultTitle, DEFAULT_SETTINGS.defaultTitle),
    defaultDescription: orDefault(row?.defaultDescription, DEFAULT_SETTINGS.defaultDescription),
    gaMeasurementId: orDefault(row?.gaMeasurementId, env.gaId ?? ""),
    googleSiteVerification: orDefault(row?.googleSiteVerification, env.googleSiteVerification ?? ""),
    publicationDisclaimer: orDefault(row?.publicationDisclaimer, DEFAULT_SETTINGS.publicationDisclaimer),
    contactNotice: orDefault(row?.contactNotice, DEFAULT_SETTINGS.contactNotice),
    contactConsentLabel: orDefault(row?.contactConsentLabel, DEFAULT_SETTINGS.contactConsentLabel),
    contactRecipientEmail: orDefault(row?.contactRecipientEmail, env.contactToEmail ?? ""),
    storeContactMessages: row?.storeContactMessages ?? true,
    messageRetentionDays: row?.messageRetentionDays ?? 365,
  };
});

export type PageView = {
  key: PageKey;
  title: string;
  content: string;
  data: Record<string, string>;
  seoTitle: string | null;
  seoDescription: string | null;
  ogImage: MediaRef | null;
  reviewedAt: Date | null;
  updatedAt: Date | null;
};

export const getPage = cache(async (key: PageKey): Promise<PageView> => {
  const row = await db.page.findUnique({ where: { key }, include: { ogImage: { select: mediaRefSelect } } });

  const defaults = key === "home" ? HOME_DEFAULTS : key === "about" ? ABOUT_DEFAULTS : {};
  const data: Record<string, string> = { ...defaults };
  const stored = (row?.data ?? {}) as Record<string, unknown>;
  for (const [k, v] of Object.entries(stored)) {
    if (typeof v === "string" && v.trim()) data[k] = v;
  }

  const legalDefault = key in LEGAL_DEFAULTS ? LEGAL_DEFAULTS[key as keyof typeof LEGAL_DEFAULTS] : "";
  return {
    key,
    title: orDefault(row?.title, PAGE_META[key].title),
    content: orDefault(row?.content, legalDefault),
    data,
    seoTitle: row?.seoTitle ?? null,
    seoDescription: row?.seoDescription ?? null,
    ogImage: row?.ogImage ?? null,
    reviewedAt: row?.reviewedAt ?? null,
    updatedAt: row?.updatedAt ?? null,
  };
});
