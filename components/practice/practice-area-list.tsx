import Link from "next/link";
import { Arrow } from "@/components/ui/primitives";
import type { AreaCard } from "@/lib/data/types";
import { pad2 } from "@/lib/utils";

/**
 * Numaralandırılmış editoryal çalışma alanı listesi (ızgara yerine): numara · başlık · kısa açıklama · ok.
 * Hover'da başlık hafifçe kayar, numara bordoya döner. Mobilde tüm satır büyük bir dokunma alanıdır.
 */
export function PracticeAreaList({ areas, className }: { areas: AreaCard[]; className?: string }) {
  return (
    <ol className={`border-b border-foreground/25 ${className ?? ""}`}>
      {areas.map((area, i) => (
        <li key={area.id} className="border-t border-foreground/25">
          <Link
            href={`/calisma-alanlari/${area.slug}`}
            className="group grid grid-cols-[auto_1fr_auto] items-start gap-x-4 gap-y-2 py-6 transition-colors hover:bg-surface sm:gap-x-6 sm:py-7 lg:grid-cols-12 lg:items-center lg:gap-x-8 lg:px-2"
          >
            <span className="index-num pt-1.5 transition-colors group-hover:text-wine-dark lg:col-span-1 lg:pt-0">{pad2(i + 1)}</span>
            <span className="min-w-0 lg:col-span-5">
              <span className="block font-serif text-[1.55rem] leading-tight transition-transform duration-300 group-hover:translate-x-1 sm:text-[1.9rem] lg:text-[2.1rem]">
                {area.title}
              </span>
              {area.shortDescription ? (
                <span className="mt-2 block text-[0.95rem] leading-relaxed text-quiet lg:hidden">{area.shortDescription}</span>
              ) : null}
            </span>
            <span className="hidden text-[0.97rem] leading-relaxed text-quiet lg:col-span-5 lg:block">{area.shortDescription}</span>
            <span className="flex justify-end pt-2 text-forest lg:col-span-1 lg:pt-0">
              <Arrow className="transition-transform duration-300 group-hover:translate-x-1.5" />
              <span className="sr-only">Detaylar</span>
            </span>
          </Link>
        </li>
      ))}
    </ol>
  );
}
