import { absoluteUrl } from "@/lib/env";
import { htmlToText, truncate } from "@/lib/text";
import { mediaUrl } from "@/lib/data/types";
import type { SiteSettingsView } from "@/lib/data/site";
import type { PublicationDetail } from "@/lib/data/publications";
import type { TeamDetail } from "@/lib/data/team";

/**
 * schema.org JSON-LD üreticileri.
 * Bilinçli olarak EKLENMEYENLER: rating, review, aggregateRating, award — uydurma/yanıltıcı olabileceğinden ve
 * avukatlık reklam kurallarına aykırılık riski taşıdığından hiçbir koşulda üretilmez.
 */
export const ORG_ID = () => `${absoluteUrl("/")}#organization`;

/** Script içine güvenle gömülebilecek JSON (</script> kırılmasını önler). */
export function jsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c").replace(/\p{Zl}/gu, "\\u2028").replace(/\p{Zp}/gu, "\\u2029");
}

const sameAs = (s: SiteSettingsView) => Object.values(s.social).filter((v) => /^https?:\/\//i.test(v));

export function organizationLd(s: SiteSettingsView) {
  // Adres ve iletişim bilgisi girilmişse LegalService (LocalBusiness alt türü), aksi halde genel Organization.
  const hasLocalInfo = Boolean(s.address && (s.phone || s.email));
  const ld: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": hasLocalInfo ? "LegalService" : "Organization",
    "@id": ORG_ID(),
    name: s.firmName,
    url: absoluteUrl("/"),
    logo: absoluteUrl(s.logo ? mediaUrl(s.logo.id) : "/brand/icon-512.png"),
    description: s.defaultDescription,
  };
  if (s.email) ld.email = s.email;
  if (s.phone) ld.telephone = s.phone;
  if (s.address) {
    ld.address = { "@type": "PostalAddress", streetAddress: s.address.replace(/\s*\n\s*/g, ", "), addressLocality: "Ankara", addressCountry: "TR" };
  }
  const links = sameAs(s);
  if (links.length) ld.sameAs = links;
  return ld;
}

export function websiteLd(s: SiteSettingsView) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${absoluteUrl("/")}#website`,
    url: absoluteUrl("/"),
    name: s.firmName,
    inLanguage: "tr-TR",
    publisher: { "@id": ORG_ID() },
  };
}

export type Crumb = { name: string; path: string };

export function breadcrumbLd(items: Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: absoluteUrl(c.path),
    })),
  };
}

export function personLd(m: TeamDetail) {
  const ld: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${absoluteUrl(`/ekibimiz/${m.slug}`)}#person`,
    name: m.fullName,
    jobTitle: m.title,
    url: absoluteUrl(`/ekibimiz/${m.slug}`),
    worksFor: { "@id": ORG_ID() },
  };
  if (m.photo) ld.image = absoluteUrl(mediaUrl(m.photo.id));
  if (m.shortBio) ld.description = truncate(m.shortBio, 300);
  if (m.linkedin && /^https?:\/\//i.test(m.linkedin) && !m.hiddenFields.includes("linkedin")) ld.sameAs = [m.linkedin];
  return ld;
}

export function articleLd(p: PublicationDetail) {
  const url = absoluteUrl(`/yayinlar/${p.slug}`);
  const ld: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Article",
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    headline: truncate(p.title, 110),
    description: truncate(p.excerpt || htmlToText(p.content), 200),
    inLanguage: "tr-TR",
    url,
    datePublished: p.publishedAt?.toISOString(),
    dateModified: p.updatedAt.toISOString(),
    author: p.author.slug
      ? { "@type": "Person", name: p.author.name, url: absoluteUrl(`/ekibimiz/${p.author.slug}`) }
      : { "@type": "Organization", name: p.author.name },
    publisher: { "@id": ORG_ID() },
  };
  if (p.cover) ld.image = [absoluteUrl(mediaUrl(p.cover.id))];
  if (p.category) ld.articleSection = p.category.name;
  if (p.tags.length) ld.keywords = p.tags.map((t) => t.name).join(", ");
  return ld;
}
