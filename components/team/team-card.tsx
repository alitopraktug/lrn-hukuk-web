import Link from "next/link";
import { MediaImage } from "@/components/ui/media";
import { Arrow } from "@/components/ui/primitives";
import type { TeamCardData } from "@/lib/data/types";

/** Ekip kartı: 4:5 portre, ad soyad, unvan, kısa bilgi. Fotoğraf yoksa marka yer tutucusu gösterilir. */
export function TeamCard({ member, priority }: { member: TeamCardData; priority?: boolean }) {
  return (
    <article className="group flex h-full flex-col">
      <Link href={`/ekibimiz/${member.slug}`} className="block" aria-label={`${member.fullName} – profili görüntüle`}>
        <div className="relative aspect-[4/5] overflow-hidden bg-stone/25">
          {member.photo ? (
            <MediaImage
              media={member.photo}
              fill
              priority={priority}
              sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
              style={{ objectPosition: member.photoPosition }}
            />
          ) : (
            <PortraitPlaceholder />
          )}
          <span aria-hidden="true" className="pointer-events-none absolute inset-0 border border-foreground/10" />
        </div>
      </Link>
      <div className="flex flex-1 flex-col pt-5">
        <h3 className="font-serif text-[1.6rem] leading-tight">
          <Link href={`/ekibimiz/${member.slug}`} className="transition-colors hover:text-wine">
            {member.fullName}
          </Link>
        </h3>
        <p className="eyebrow mt-2">{member.title}</p>
        {member.shortBio ? <p className="mt-3 line-clamp-3 text-[0.95rem] leading-relaxed text-quiet">{member.shortBio}</p> : null}
        <Link
          href={`/ekibimiz/${member.slug}`}
          aria-hidden="true"
          tabIndex={-1}
          className="link-arrow mt-auto self-start pt-5"
        >
          Profil
          <Arrow />
        </Link>
      </div>
    </article>
  );
}

/** Fotoğraf eklenene kadar gösterilen, klişe içermeyen marka yer tutucusu. */
export function PortraitPlaceholder({ className }: { className?: string }) {
  return (
    <div className={`absolute inset-0 flex items-center justify-center bg-gradient-to-b from-stone/20 to-stone/35 ${className ?? ""}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/logo-mark.svg" alt="" width={112} height={103} className="w-28 opacity-25" />
    </div>
  );
}
