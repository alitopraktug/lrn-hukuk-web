import Link from "next/link";
import { jsonLd, breadcrumbLd, type Crumb } from "@/lib/jsonld";
import { prepareRichText } from "@/lib/richtext";
import { cn } from "@/lib/utils";
import { UI, type Locale } from "@/lib/i18n/config";

export function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(data) }} />;
}

/** Sayfa yolu (breadcrumb) + BreadcrumbList JSON-LD. İlk öğe olarak "Ana Sayfa" otomatik eklenir. */
export function Breadcrumb({ items, className, locale = "tr" }: { items: Crumb[]; className?: string; locale?: Locale }) {
  const t = UI[locale];
  const all: Crumb[] = [{ name: t.breadcrumbHome, path: locale === "tr" ? "/" : "/en" }, ...items];
  return (
    <>
      <nav aria-label={locale === "tr" ? "Sayfa yolu" : "Breadcrumb"} className={cn("text-[0.8rem] text-quiet", className)}>
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {all.map((c, i) => {
            const last = i === all.length - 1;
            return (
              <li key={c.path} className="flex items-center gap-2">
                {last ? (
                  <span aria-current="page" className="max-w-[16rem] truncate text-foreground sm:max-w-md">
                    {c.name}
                  </span>
                ) : (
                  <Link href={c.path} className="underline-offset-4 hover:text-wine hover:underline">
                    {c.name}
                  </Link>
                )}
                {!last ? (
                  <span aria-hidden="true" className="text-stone">
                    /
                  </span>
                ) : null}
              </li>
            );
          })}
        </ol>
      </nav>
      <JsonLd data={breadcrumbLd(all)} />
    </>
  );
}

/**
 * Zengin metin gösterimi. HTML burada bir kez daha sanitize edilir (savunma katmanı); ham HTML hiçbir zaman
 * doğrudan render edilmez. `prepared` verilirse yeniden hesaplanmaz.
 */
export function RichText({ html, prepared, className }: { html?: string; prepared?: { html: string }; className?: string }) {
  const safe = prepared ?? prepareRichText(html ?? "");
  return <div className={cn("prose-lrn", className)} dangerouslySetInnerHTML={{ __html: safe.html }} />;
}
