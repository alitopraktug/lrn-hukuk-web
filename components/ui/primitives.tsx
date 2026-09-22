import Link from "next/link";
import type { ComponentProps, ElementType, ReactNode } from "react";
import { cn, splitEmphasis } from "@/lib/utils";

/** İçerik genişliği ve yatay boşluk — tüm bölümlerde aynı ızgara. */
export function Container({ as, className, children, ...rest }: { as?: ElementType; className?: string; children: ReactNode } & ComponentProps<"div">) {
  const Tag = (as ?? "div") as ElementType;
  return (
    <Tag className={cn("mx-auto w-full max-w-[1320px] px-5 sm:px-8 lg:px-12", className)} {...rest}>
      {children}
    </Tag>
  );
}

type SectionProps = {
  id?: string;
  tone?: "default" | "surface" | "dark";
  className?: string;
  children: ReactNode;
  labelledBy?: string;
  bordered?: boolean;
};

export function Section({ id, tone = "default", className, children, labelledBy, bordered = true }: SectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={cn(
        "relative py-20 sm:py-24 lg:py-32",
        tone === "surface" && "bg-surface",
        tone === "dark" && "on-dark bg-forest-dark text-background",
        bordered && tone !== "dark" && "border-t border-line",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function Arrow({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 12" width="22" height="11" fill="none" stroke="currentColor" strokeWidth="1.25" className={className}>
      <path d="M0 6h22M17 1l5 5-5 5" />
    </svg>
  );
}

type LinkButtonProps = {
  href: string;
  variant?: "primary" | "outline" | "light" | "outline-light";
  children: ReactNode;
  className?: string;
  arrow?: boolean;
} & Omit<ComponentProps<typeof Link>, "href" | "className" | "children">;

export function ButtonLink({ href, variant = "primary", children, className, arrow, ...rest }: LinkButtonProps) {
  return (
    <Link href={href} className={cn("btn", `btn-${variant}`, className)} {...rest}>
      {children}
      {arrow ? <Arrow /> : null}
    </Link>
  );
}

export function LinkArrow({ href, children, className, ...rest }: { href: string; children: ReactNode; className?: string } & Omit<ComponentProps<typeof Link>, "href" | "className" | "children">) {
  return (
    <Link href={href} className={cn("link-arrow", className)} {...rest}>
      {children}
      <Arrow />
    </Link>
  );
}

/** Numaralandırılmış bölüm başlığı — sitenin görsel imzası (sol sütunda numara + etiket, sağda içerik). */
export function SectionHeader({
  index,
  eyebrow,
  title,
  intro,
  id,
  action,
  level = 2,
  className,
}: {
  index?: string;
  eyebrow?: string;
  title: ReactNode;
  intro?: ReactNode;
  id?: string;
  action?: ReactNode;
  level?: 1 | 2;
  className?: string;
}) {
  const Heading = level === 1 ? "h1" : "h2";
  return (
    <div className={cn("grid grid-cols-12 md:gap-x-8 gap-y-6", className)}>
      <div className="col-span-12 flex items-center gap-4 lg:col-span-3 lg:flex-col lg:items-start lg:gap-3">
        {index ? <span className="index-num">{index}</span> : null}
        {index ? <span aria-hidden="true" className="h-px w-10 bg-wine/60 lg:w-8" /> : null}
        {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
      </div>
      <div className="col-span-12 lg:col-span-9">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <Heading id={id} className="display-lg">
              {title}
            </Heading>
            {intro ? <p className="lead mt-5 max-w-2xl">{intro}</p> : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      </div>
    </div>
  );
}

/** "*kelime*" işaretini <em> olarak render eder (HTML enjeksiyonu yok). */
export function Emphasis({ text }: { text: string }) {
  return (
    <>
      {splitEmphasis(text).map((p, i) => (p.em ? <em key={i}>{p.text}</em> : <span key={i}>{p.text}</span>))}
    </>
  );
}

export function EmptyState({ title, children, className }: { title: string; children?: ReactNode; className?: string }) {
  return (
    <div className={cn("border border-dashed border-foreground/20 px-6 py-14 text-center sm:px-10", className)}>
      <p className="display-md">{title}</p>
      {children ? <div className="mx-auto mt-3 max-w-md text-quiet">{children}</div> : null}
    </div>
  );
}
