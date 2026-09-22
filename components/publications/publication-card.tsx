import Link from "next/link";
import { MediaImage } from "@/components/ui/media";
import { Arrow } from "@/components/ui/primitives";
import type { PublicationCardData } from "@/lib/data/types";
import { formatDate, isoDate } from "@/lib/utils";
import { UI, type Locale } from "@/lib/i18n/config";

/** Yayın kartı — kutulanmamış, editoryal: kategori, tarih, başlık, özet, okuma süresi.
 *  `basePath`/`locale`: /en altında "/en/publications" ve "en" geçilir (içerik yine de Türkçedir). */
export function PublicationCard({
  pub,
  showCover = false,
  basePath = "/yayinlar",
  locale = "tr",
}: {
  pub: PublicationCardData;
  showCover?: boolean;
  basePath?: string;
  locale?: Locale;
}) {
  const href = `${basePath}/${pub.slug}`;
  const t = UI[locale];
  return (
    <article className="group flex h-full flex-col border-t border-foreground/25 pt-5">
      {showCover && pub.cover ? (
        <Link href={href} tabIndex={-1} aria-hidden="true" className="mb-5 block">
          <div className="relative aspect-[16/10] overflow-hidden bg-stone/25">
            <MediaImage
              media={pub.cover}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
            />
          </div>
        </Link>
      ) : null}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.8rem] text-quiet">
        {pub.category ? <span className="eyebrow">{pub.category.name}</span> : null}
        {pub.category && pub.publishedAt ? <span aria-hidden="true">·</span> : null}
        {pub.publishedAt ? <time dateTime={isoDate(pub.publishedAt)}>{formatDate(pub.publishedAt)}</time> : null}
        {pub.featured ? (
          <>
            <span aria-hidden="true">·</span>
            <span className="font-semibold text-wine">{t.featured}</span>
          </>
        ) : null}
      </div>
      <h3 className="mt-3 font-serif text-[1.65rem] leading-[1.15] sm:text-[1.8rem]">
        <Link href={href} className="transition-colors group-hover:text-wine">
          {pub.title}
        </Link>
      </h3>
      {pub.excerpt ? <p className="mt-3 line-clamp-3 text-[0.97rem] leading-relaxed text-quiet">{pub.excerpt}</p> : null}
      <div className="mt-auto flex items-center justify-between gap-4 pt-6">
        <Link href={href} className="link-arrow" aria-label={`${pub.title} — ${t.read}`}>
          {t.read}
          <Arrow />
        </Link>
        <span className="text-[0.8rem] text-quiet">{t.readingMinutes(pub.readingMinutes)}</span>
      </div>
    </article>
  );
}
