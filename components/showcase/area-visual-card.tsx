import Link from "next/link";
import { Arrow } from "@/components/ui/primitives";
import type { AreaCard } from "@/lib/data/types";
import { pad2 } from "@/lib/utils";

/**
 * "Tasarım B" önizlemesine özgü kart: stok fotoğraf yerine marka motifi (site genelinde ekip yer
 * tutucusunda kullanılan aynı silik LRN işareti), kutulu/dolu bir görünüm için.
 */
export function AreaVisualCard({ area, index }: { area: AreaCard; index: number }) {
  return (
    <li className="reveal group border border-line bg-surface transition-colors hover:border-forest/50">
      <Link href={`/calisma-alanlari/${area.slug}`} className="flex h-full flex-col">
        <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-forest">
          <span aria-hidden="true" className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: "linear-gradient(135deg, transparent 48%, currentColor 48% 52%, transparent 52%)", color: "var(--color-background)" }} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo-mark-light.svg" alt="" width={112} height={103} className="w-16 opacity-[0.16] transition-transform duration-500 group-hover:scale-110" />
          <span className="absolute left-4 top-4 font-serif text-[0.9rem] text-background/70">{pad2(index)}</span>
        </div>
        <div className="flex flex-1 flex-col p-6">
          <h3 className="font-serif text-[1.4rem] leading-tight">{area.title}</h3>
          {area.shortDescription ? <p className="mt-2 line-clamp-3 text-[0.92rem] leading-relaxed text-quiet">{area.shortDescription}</p> : null}
          <span className="link-arrow mt-auto self-start pt-5">
            Detaylar
            <Arrow />
          </span>
        </div>
      </Link>
    </li>
  );
}
