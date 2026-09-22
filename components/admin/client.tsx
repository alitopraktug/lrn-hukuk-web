"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { btnClass } from "@/components/admin/ui";
import { slugify } from "@/lib/slug";
import { cn } from "@/lib/utils";

/** Form gönderilirken devre dışı kalan ve durumu bildiren düğme. */
export function SubmitButton({
  children,
  pendingLabel = "Kaydediliyor…",
  variant = "primary",
  name,
  value,
  className,
  pending: pendingProp,
  activeIntent,
}: {
  children: ReactNode;
  pendingLabel?: string;
  variant?: keyof typeof btnClass;
  name?: string;
  value?: string;
  className?: string;
  /** useServerForm kullanılan formlarda dışarıdan verilir; verilmezse <form action> durumu (useFormStatus) izlenir. */
  pending?: boolean;
  activeIntent?: string | null;
}) {
  const status = useFormStatus();
  const pending = pendingProp ?? status.pending;
  // Aynı formda birden çok gönder düğmesi olduğunda yalnızca tıklanan düğme "Kaydediliyor…" gösterir.
  const intent = activeIntent !== undefined ? activeIntent : ((status.data?.get(name ?? "") as string | null) ?? null);
  const mine = pending && (!name || intent === value);
  return (
    <button type="submit" name={name} value={value} disabled={pending} className={cn(btnClass[variant], className)}>
      {mine ? pendingLabel : children}
    </button>
  );
}

/**
 * Yıkıcı işlemler için açık onay penceresi (yerel <dialog>: odak tuzağı ve Esc ile kapanma yerleşiktir).
 * Kullanım: <ConfirmForm action={fn} title="…" message="…" confirmLabel="Sil">Sil</ConfirmForm>
 */
export function ConfirmForm({
  action,
  children,
  title,
  message,
  confirmLabel = "Evet, sil",
  variant = "dangerGhost",
  hidden,
  className,
}: {
  action: (formData: FormData) => void | Promise<void>;
  children: ReactNode;
  title: string;
  message: ReactNode;
  confirmLabel?: string;
  variant?: keyof typeof btnClass;
  hidden?: Record<string, string>;
  className?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const uid = useId();
  return (
    <>
      <button type="button" className={cn(btnClass[variant], className)} onClick={() => ref.current?.showModal()}>
        {children}
      </button>
      <dialog
        ref={ref}
        aria-labelledby={`${uid}-title`}
        className="m-auto w-[min(92vw,28rem)] rounded-xl border border-line bg-white p-0 text-foreground shadow-soft backdrop:bg-ink/50"
        onClick={(e) => {
          if (e.target === ref.current) ref.current?.close();
        }}
      >
        <form action={action} className="p-6">
          {Object.entries(hidden ?? {}).map(([k, v]) => (
            <input key={k} type="hidden" name={k} value={v} />
          ))}
          <h2 id={`${uid}-title`} className="font-sans text-lg font-bold">
            {title}
          </h2>
          <div className="mt-2 text-[0.93rem] leading-relaxed text-quiet">{message}</div>
          <div className="mt-6 flex justify-end gap-2">
            <button type="button" className={btnClass.secondary} onClick={() => ref.current?.close()} autoFocus>
              Vazgeç
            </button>
            <SubmitButton variant="danger" pendingLabel="İşleniyor…">
              {confirmLabel}
            </SubmitButton>
          </div>
        </form>
      </dialog>
    </>
  );
}

/** Başlıktan otomatik slug önerir (yalnızca kullanıcı slug'ı elle değiştirmediyse). */
export function SlugField({
  name = "slug",
  titleName = "title",
  defaultValue = "",
  error,
  editing,
  generateLabel = "Başlıktan üret",
}: {
  name?: string;
  titleName?: string;
  defaultValue?: string;
  error?: string;
  editing?: boolean;
  generateLabel?: string;
}) {
  const [value, setValue] = useState(defaultValue);
  const touched = useRef(Boolean(defaultValue));

  useEffect(() => {
    if (editing) return; // mevcut kayıtların adresi kendiliğinden değişmez
    const titleInput = document.getElementById(titleName) as HTMLInputElement | null;
    if (!titleInput) return;
    const onInput = () => {
      if (!touched.current) setValue(slugify(titleInput.value));
    };
    titleInput.addEventListener("input", onInput);
    return () => titleInput.removeEventListener("input", onInput);
  }, [titleName, editing]);

  return (
    <div>
      <div className="flex gap-2">
        <input
          id={name}
          name={name}
          value={value}
          onChange={(e) => {
            touched.current = true;
            setValue(e.target.value.toLowerCase());
          }}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${name}-error` : `${name}-hint`}
          autoComplete="off"
          spellCheck={false}
          className="block w-full rounded-md border border-foreground/25 bg-white px-3 py-2.5 font-mono text-[0.88rem] focus:border-forest focus:outline-none focus:ring-2 focus:ring-forest/20 aria-[invalid=true]:border-danger"
        />
        <button
          type="button"
          className={btnClass.secondary}
          onClick={() => {
            const titleInput = document.getElementById(titleName) as HTMLInputElement | null;
            if (titleInput) {
              touched.current = false;
              setValue(slugify(titleInput.value));
            }
          }}
        >
          {generateLabel}
        </button>
      </div>
    </div>
  );
}
