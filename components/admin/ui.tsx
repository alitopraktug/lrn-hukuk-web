import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import type { ActionState } from "@/lib/actions";
import { cn, isFuture } from "@/lib/utils";

/**
 * Yönetim paneli için sade, işlevsel arayüz parçaları. Herkese açık sitenin editoryal tasarımından bilinçli olarak
 * ayrışır: net etiketler, sade Türkçe, yeterli boşluk, görünür odak halkaları.
 */

export const inputClass =
  "block w-full rounded-md border border-foreground/25 bg-white px-3 py-2.5 text-[0.95rem] leading-snug text-foreground placeholder:text-stone focus:border-forest focus:outline-none focus:ring-2 focus:ring-forest/20 aria-[invalid=true]:border-danger aria-[invalid=true]:ring-2 aria-[invalid=true]:ring-danger/15 disabled:bg-admin disabled:text-quiet";

const btnBase =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-md px-4 py-2 text-[0.9rem] font-semibold leading-tight transition-colors disabled:cursor-not-allowed disabled:opacity-60";
export const btnClass = {
  primary: `${btnBase} bg-forest text-background hover:bg-forest-dark`,
  secondary: `${btnBase} border border-foreground/25 bg-white text-foreground hover:bg-admin`,
  danger: `${btnBase} bg-danger text-white hover:bg-danger-dark`,
  ghost: `${btnBase} text-forest hover:bg-forest/10`,
  dangerGhost: `${btnBase} text-danger hover:bg-danger/10`,
} as const;

export function PageHeader({ title, description, actions }: { title: string; description?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="font-sans text-[1.65rem] font-bold leading-tight tracking-tight">{title}</h1>
        {description ? <p className="mt-1.5 max-w-2xl text-[0.95rem] text-quiet">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function Card({ title, description, children, className, actions }: { title?: string; description?: ReactNode; children: ReactNode; className?: string; actions?: ReactNode }) {
  return (
    <section className={cn("rounded-xl border border-line bg-white", className)}>
      {title || actions ? (
        <header className="flex items-start justify-between gap-4 border-b border-line px-5 py-4 sm:px-6">
          <div>
            {title ? <h2 className="font-sans text-[1.02rem] font-bold">{title}</h2> : null}
            {description ? <p className="mt-1 text-[0.88rem] text-quiet">{description}</p> : null}
          </div>
          {actions}
        </header>
      ) : null}
      <div className="p-5 sm:p-6">{children}</div>
    </section>
  );
}

export function Field({
  label,
  name,
  error,
  hint,
  required,
  children,
  className,
}: {
  label: string;
  name: string;
  error?: string;
  hint?: ReactNode;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={name} className="mb-1.5 block text-[0.85rem] font-semibold">
        {label}
        {required ? (
          <span aria-hidden="true" className="ml-0.5 text-danger">
            *
          </span>
        ) : null}
      </label>
      {children}
      {hint && !error ? (
        <p id={`${name}-hint`} className="mt-1.5 text-[0.82rem] leading-snug text-quiet">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${name}-error`} role="alert" className="mt-1.5 text-[0.85rem] font-medium text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}

type InputProps = Omit<ComponentProps<"input">, "name" | "id"> & { name: string; error?: string };

export function TextInput({ name, error, className, ...rest }: InputProps) {
  return <input id={name} name={name} aria-invalid={error ? true : undefined} aria-describedby={error ? `${name}-error` : `${name}-hint`} className={cn(inputClass, className)} {...rest} />;
}

export function TextArea({ name, error, className, rows = 4, ...rest }: Omit<ComponentProps<"textarea">, "name" | "id"> & { name: string; error?: string }) {
  return <textarea id={name} name={name} rows={rows} aria-invalid={error ? true : undefined} aria-describedby={error ? `${name}-error` : `${name}-hint`} className={cn(inputClass, "resize-y", className)} {...rest} />;
}

export function Select({ name, error, className, children, ...rest }: Omit<ComponentProps<"select">, "name" | "id"> & { name: string; error?: string }) {
  return (
    <select id={name} name={name} aria-invalid={error ? true : undefined} className={cn(inputClass, "pr-8", className)} {...rest}>
      {children}
    </select>
  );
}

export function Checkbox({ name, label, hint, defaultChecked, value = "on", id }: { name: string; label: ReactNode; hint?: ReactNode; defaultChecked?: boolean; value?: string; id?: string }) {
  const inputId = id ?? name;
  return (
    <div className="flex items-start gap-3">
      <input id={inputId} name={name} type="checkbox" value={value} defaultChecked={defaultChecked} className="mt-1 h-[1.1rem] w-[1.1rem] shrink-0 rounded accent-forest" />
      <label htmlFor={inputId} className="text-[0.92rem] leading-snug">
        <span className="font-medium">{label}</span>
        {hint ? <span className="mt-0.5 block text-[0.82rem] text-quiet">{hint}</span> : null}
      </label>
    </div>
  );
}

export function Alert({ tone = "info", children, className }: { tone?: "info" | "success" | "error" | "warning"; children: ReactNode; className?: string }) {
  const tones = {
    info: "border-forest/30 bg-forest/5 text-foreground",
    success: "border-forest/40 bg-forest/10 text-forest-dark",
    error: "border-danger/40 bg-danger/10 text-danger-dark",
    warning: "border-[#b7791f]/40 bg-[#b7791f]/10 text-[#7a4f0e]",
  } as const;
  return (
    <div role={tone === "error" ? "alert" : "status"} className={cn("rounded-lg border px-4 py-3 text-[0.92rem] leading-snug", tones[tone], className)}>
      {children}
    </div>
  );
}

/** Server action sonucunu (başarı/hata) gösterir. */
export function FormFeedback({ state, className }: { state: ActionState; className?: string }) {
  if (state.status === "idle" || !state.message) return null;
  return (
    <Alert tone={state.status === "success" ? "success" : "error"} className={className}>
      {state.message}
    </Alert>
  );
}

const badgeTones = {
  green: "bg-forest/12 text-forest-dark",
  gray: "bg-foreground/8 text-quiet",
  amber: "bg-[#b7791f]/15 text-[#7a4f0e]",
  red: "bg-danger/12 text-danger-dark",
  blue: "bg-[#2b5f8a]/12 text-[#1d4468]",
} as const;

export function Badge({ tone = "gray", children }: { tone?: keyof typeof badgeTones; children: ReactNode }) {
  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-[0.75rem] font-semibold", badgeTones[tone])}>{children}</span>;
}

export function StatusBadge({ status, publishedAt, deleted, active }: { status: "DRAFT" | "PUBLISHED"; publishedAt?: Date | null; deleted?: boolean; active?: boolean }) {
  if (deleted) return <Badge tone="red">Silindi</Badge>;
  if (status === "PUBLISHED") {
    if (isFuture(publishedAt)) return <Badge tone="blue">Zamanlanmış</Badge>;
    return <Badge tone="green">{active ? "Aktif" : "Yayında"}</Badge>;
  }
  return <Badge tone="amber">{active ? "Pasif" : "Taslak"}</Badge>;
}

export function EmptyRow({ children, colSpan = 6 }: { children: ReactNode; colSpan?: number }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-12 text-center text-[0.95rem] text-quiet">
        {children}
      </td>
    </tr>
  );
}

export function Table({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("overflow-x-auto rounded-xl border border-line bg-white", className)}>
      <table className="w-full min-w-[42rem] border-collapse text-left text-[0.9rem]">{children}</table>
    </div>
  );
}
export const th = "border-b border-line bg-admin/60 px-4 py-3 text-[0.75rem] font-bold uppercase tracking-wider text-quiet";
export const td = "border-b border-line px-4 py-3.5 align-middle last:border-b-0";

export function Tabs({ items }: { items: { href: string; label: string; active: boolean; count?: number }[] }) {
  return (
    <nav aria-label="Filtre" className="mb-5 flex flex-wrap gap-1 border-b border-line">
      {items.map((t) => (
        <Link
          key={t.href}
          href={t.href}
          aria-current={t.active ? "page" : undefined}
          className={cn(
            "-mb-px border-b-2 px-3.5 py-2.5 text-[0.9rem] font-semibold transition-colors",
            t.active ? "border-forest text-forest" : "border-transparent text-quiet hover:text-foreground",
          )}
        >
          {t.label}
          {typeof t.count === "number" ? <span className="ml-1.5 text-[0.8rem] font-medium text-quiet">({t.count})</span> : null}
        </Link>
      ))}
    </nav>
  );
}

export function AdminPager({ page, pageCount, makeHref }: { page: number; pageCount: number; makeHref: (p: number) => string }) {
  if (pageCount <= 1) return null;
  return (
    <nav aria-label="Sayfalama" className="mt-6 flex items-center justify-between text-[0.9rem]">
      {page > 1 ? (
        <Link href={makeHref(page - 1)} className={btnClass.secondary}>
          ← Önceki
        </Link>
      ) : (
        <span />
      )}
      <span className="text-quiet">
        Sayfa {page} / {pageCount}
      </span>
      {page < pageCount ? (
        <Link href={makeHref(page + 1)} className={btnClass.secondary}>
          Sonraki →
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
