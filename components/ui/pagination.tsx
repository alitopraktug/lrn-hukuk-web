import Link from "next/link";
import { cn } from "@/lib/utils";

/** Klasik (sayfa numaralı) sayfalama — SEO açısından tarayıcıların izleyebileceği gerçek bağlantılar. */
export function Pagination({
  page,
  pageCount,
  makeHref,
  className,
  label = "Sayfalama",
}: {
  page: number;
  pageCount: number;
  makeHref: (page: number) => string;
  className?: string;
  label?: string;
}) {
  if (pageCount <= 1) return null;

  const pages: (number | "…")[] = [];
  const add = (n: number | "…") => pages.push(n);
  for (let i = 1; i <= pageCount; i++) {
    if (i === 1 || i === pageCount || Math.abs(i - page) <= 1) add(i);
    else if (pages[pages.length - 1] !== "…") add("…");
  }

  const item = "flex h-11 min-w-11 items-center justify-center px-3 text-sm transition-colors";
  return (
    <nav aria-label={label} className={cn("flex flex-wrap items-center justify-center gap-1", className)}>
      {page > 1 ? (
        <Link href={makeHref(page - 1)} rel="prev" className={cn(item, "border border-line hover:border-wine hover:text-wine")}>
          Önceki
        </Link>
      ) : null}
      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`gap-${i}`} aria-hidden="true" className={cn(item, "text-stone")}>
            …
          </span>
        ) : p === page ? (
          <span key={p} aria-current="page" className={cn(item, "bg-wine text-background")}>
            {p}
          </span>
        ) : (
          <Link key={p} href={makeHref(p)} aria-label={`Sayfa ${p}`} className={cn(item, "border border-transparent hover:border-line hover:text-wine")}>
            {p}
          </Link>
        ),
      )}
      {page < pageCount ? (
        <Link href={makeHref(page + 1)} rel="next" className={cn(item, "border border-line hover:border-wine hover:text-wine")}>
          Sonraki
        </Link>
      ) : null}
    </nav>
  );
}
