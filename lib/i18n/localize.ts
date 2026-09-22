import "server-only";
import type { AreaCard } from "@/lib/data/types";
import type { AreaDetail } from "@/lib/data/areas";
import type { TeamCardData } from "@/lib/data/types";
import type { TeamDetail } from "@/lib/data/team";
import { AREA_TRANSLATIONS_EN, TEAM_TRANSLATIONS_EN } from "@/lib/i18n/content-en";
import type { Locale } from "@/lib/i18n/config";

/** Çalışma alanı listesindeki her kart için EN çevirisi varsa uygular (yoksa TR kalır). */
export function localizeAreaCards(areas: AreaCard[], locale: Locale): AreaCard[] {
  if (locale === "tr") return areas;
  return areas.map((a) => {
    const tr = AREA_TRANSLATIONS_EN[a.slug];
    return tr ? { ...a, title: tr.title, shortDescription: tr.shortDescription } : a;
  });
}

/** Çalışma alanı detay sayfası için EN çevirisi varsa title/açıklama/konular/içeriği değiştirir. */
export function localizeArea(area: AreaDetail, locale: Locale): AreaDetail & { translated: boolean } {
  if (locale === "tr") return { ...area, translated: true };
  const tr = AREA_TRANSLATIONS_EN[area.slug];
  if (!tr) return { ...area, translated: false };
  return { ...area, title: tr.title, shortDescription: tr.shortDescription, topics: tr.topics, content: tr.content, translated: true };
}

/** Ekip kartları için EN unvan/kısa bio çevirisi varsa uygular. */
export function localizeTeamCards(members: TeamCardData[], locale: Locale): TeamCardData[] {
  if (locale === "tr") return members;
  return members.map((m) => {
    const tr = TEAM_TRANSLATIONS_EN[m.slug];
    return tr ? { ...m, title: tr.title, shortBio: tr.shortBio } : m;
  });
}

/** Ekip profili sayfası için EN unvan/bio çevirisi varsa uygular. */
export function localizeTeamMember(member: TeamDetail, locale: Locale): TeamDetail & { translated: boolean } {
  if (locale === "tr") return { ...member, translated: true };
  const tr = TEAM_TRANSLATIONS_EN[member.slug];
  if (!tr) return { ...member, translated: false };
  return { ...member, title: tr.title, shortBio: tr.shortBio, bio: tr.bio, translated: true };
}
