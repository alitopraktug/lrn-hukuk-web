import Link from "next/link";
import { Arrow } from "@/components/ui/primitives";
import type { AreaCard } from "@/lib/data/types";
import { pad2 } from "@/lib/utils";
import { UI, type Locale } from "@/lib/i18n/config";

/**
 * Numaralandırılmış editoryal çalışma alanı listesi (kart ızgarası değil): numara · başlık ·
 * kısa açıklama · ok. Hover'da yalnızca: başlık hafifçe sağa kayar, ok hareket eder, satırın üst
 * çizgisi bordoya döner — arka plan değişmez. Mobilde tüm satır büyük bir dokunma alanıdır.
 * `basePath`/`locale`: /en altında çağrılırken "/en/practice-areas" ve "en" geçilir.
 */
export function PracticeAreaList({
  areas,
  className,
  basePath = "/calisma-alanlari",
  locale = "tr",
}: {
  areas: AreaCard[];
  className?: string;
  basePath?: string;
  locale?: Locale;
}) {
  return (
    <ol className={`border-b border-line ${className ?? ""}`}>
      {areas.map((area, i) => (
        <li key={area.id} className="border-t border-line transition-colors duration-200 has-[a:hover]:border-wine/70 has-[a:focus-visible]:border-wine/70">
          <Link
            href={`${basePath}/${area.slug}`}
            className="group grid min-h-[92px] grid-cols-[auto_1fr_auto] items-center gap-x-4 gap-y-2 py-6 sm:gap-x-6 sm:py-7 lg:grid-cols-12 lg:gap-x-8 lg:px-2"
          >
            <span className="index-num transition-colors group-hover:text-wine-dark lg:col-span-1">{pad2(i + 1)}</span>
            <span className="min-w-0 lg:col-span-5">
              <span className="block font-serif text-[1.6rem] leading-tight transition-transform duration-200 group-hover:translate-x-1.5 sm:text-[1.9rem] lg:text-[2rem]">
                {area.title}
              </span>
              {area.shortDescription ? (
                <span className="mt-2 block text-[0.95rem] leading-relaxed text-quiet lg:hidden">{area.shortDescription}</span>
              ) : null}
            </span>
            <span className="hidden text-[0.97rem] leading-relaxed text-quiet lg:col-span-5 lg:block">{area.shortDescription}</span>
            <span className="flex justify-end text-wine lg:col-span-1">
              <Arrow className="transition-transform duration-200 group-hover:translate-x-1.5" />
              <span className="sr-only">{UI[locale].details}</span>
            </span>
          </Link>
        </li>
      ))}
    </ol>
  );
}
