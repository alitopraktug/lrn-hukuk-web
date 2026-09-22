import Image from "next/image";
import { mediaUrl, type MediaRef } from "@/lib/data/types";
import { cn } from "@/lib/utils";

/**
 * Yönetim panelinden yüklenen görseller /media/[id] üzerinden servis edilir ve next/image ile optimize edilir
 * (AVIF/WebP, duyarlı boyutlar, bulanık yer tutucu). Boyutlar bilindiği için yerleşim kayması (CLS) oluşmaz.
 */
export function MediaImage({
  media,
  sizes,
  className,
  priority,
  fill,
  style,
  alt,
}: {
  media: MediaRef;
  sizes: string;
  className?: string;
  priority?: boolean;
  fill?: boolean;
  style?: React.CSSProperties;
  alt?: string;
}) {
  const text = alt ?? media.alt ?? "";
  const common = {
    src: mediaUrl(media.id),
    sizes,
    priority,
    className,
    style,
    ...(media.blurDataUrl ? { placeholder: "blur" as const, blurDataURL: media.blurDataUrl } : {}),
  };
  if (fill) return <Image {...common} alt={text} fill />;
  return <Image {...common} alt={text} width={media.width ?? 1600} height={media.height ?? 1000} />;
}

const DEFAULTS = {
  horizontal: { dark: "/brand/logo-horizontal.svg", light: "/brand/logo-horizontal-light.svg", ratio: 1642 / 402 },
  stacked: { dark: "/brand/logo.svg", light: "/brand/logo-light.svg", ratio: 979 / 610 },
  mark: { dark: "/brand/logo-mark.svg", light: "/brand/logo-mark-light.svg", ratio: 862 / 792 },
} as const;

/**
 * Logo. Varsayılan olarak /public/brand/ altındaki SVG'ler kullanılır; yönetim panelinden logo yüklenirse o kullanılır.
 * Nihai logoyu değiştirmek için public/brand/logo*.svg dosyalarını değiştirmeniz yeterlidir (README → Logo değiştirme).
 */
export function Logo({
  logo,
  firmName,
  variant = "horizontal",
  tone = "dark",
  height = 36,
  className,
  priority,
}: {
  logo?: MediaRef | null;
  firmName: string;
  variant?: keyof typeof DEFAULTS;
  tone?: "dark" | "light";
  height?: number;
  className?: string;
  priority?: boolean;
}) {
  const d = DEFAULTS[variant];
  if (logo && variant === "horizontal") {
    const ratio = logo.width && logo.height ? logo.width / logo.height : d.ratio;
    return (
      <Image
        src={mediaUrl(logo.id)}
        alt={firmName}
        width={Math.round(height * ratio)}
        height={height}
        unoptimized
        priority={priority}
        className={cn("w-auto", className)}
        style={{ height, ...(tone === "light" ? { filter: "brightness(0) invert(1)" } : {}) }}
      />
    );
  }
  return (
    <Image
      src={tone === "light" ? d.light : d.dark}
      alt={firmName}
      width={Math.round(height * d.ratio)}
      height={height}
      unoptimized
      priority={priority}
      className={cn("w-auto", className)}
      style={{ height }}
    />
  );
}
