"use client";

import Link from "next/link";
import Script from "next/script";
import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import { submitContact } from "@/app/(public)/iletisim/actions";
import { idleState, type ActionState } from "@/lib/actions";
import { CONTACT_LIMITS } from "@/lib/validation/contact-limits";

// Zod (≈95 KB gz) ilk boyamayı geciktirmesin diye tembel yüklenir: ilk alana odaklanılınca ön yüklenir, gönderimde beklenir.
const loadSchema = () => import("@/lib/validation/contact");

type Props = {
  notice: string;
  consentLabel: string;
  turnstileSiteKey?: string;
};

/** "{{KVKK Aydınlatma Metni}}'ni okudum…" → bağlantı içeren etiket. İşaret yoksa metnin başına bağlantı eklenir. */
function ConsentLabel({ label }: { label: string }) {
  const m = label.match(/^([\s\S]*?)\{\{(.+?)\}\}([\s\S]*)$/);
  const link = (text: string) => (
    <Link href="/kvkk" target="_blank" className="text-wine underline underline-offset-4">
      {text}
    </Link>
  );
  if (!m) return <>{label} ({link("Aydınlatma Metni")})</>;
  return (
    <>
      {m[1]}
      {link(m[2])}
      {m[3]}
    </>
  );
}

export function ContactForm({ notice, consentLabel, turnstileSiteKey }: Props) {
  const [state, action, pending] = useActionState<ActionState, FormData>(submitContact, idleState);
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({});
  const [startedAt, setStartedAt] = useState("");
  const [count, setCount] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);
  const alertRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    // Formun tarayıcıda açıldığı an — çok hızlı (bot) gönderimleri sunucuda ayıklamak için.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStartedAt(String(Date.now()));
  }, []);

  // Sunucu hatasında ilk hatalı alana odaklan / genel hatayı duyur
  useEffect(() => {
    if (state.status !== "error") return;
    const firstKey = state.fieldErrors ? Object.keys(state.fieldErrors)[0] : null;
    if (firstKey) formRef.current?.querySelector<HTMLElement>(`[name="${firstKey}"]`)?.focus();
    else alertRef.current?.focus();
  }, [state]);

  if (state.status === "success") {
    return (
      <div role="status" className="border border-wine/30 bg-surface p-8 sm:p-10">
        <p className="font-serif text-3xl leading-tight">Mesajınız iletildi.</p>
        <p className="mt-4 text-[1.02rem] leading-relaxed text-quiet">{state.message}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="link-arrow mt-6"
        >
          Yeni bir mesaj gönder
        </button>
      </div>
    );
  }

  const values = state.values ?? {};
  const errors = { ...clientErrors, ...(state.fieldErrors ?? {}) };
  const clearError = (name: string) =>
    setClientErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    // Tarayıcıda anında geri bildirim (sunucu aynı şemayla yeniden doğrular). JS yoksa form doğrudan sunucuya gider.
    e.preventDefault();
    const form = e.currentTarget;
    const submitter = (e.nativeEvent as SubmitEvent).submitter;
    const { contactSchema } = await loadSchema();
    const data = new FormData(form, submitter);
    const result = contactSchema.safeParse(Object.fromEntries(data));
    if (!result.success) {
      const next: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = String(issue.path[0] ?? "_");
        if (!(key in next)) next[key] = issue.message;
      }
      setClientErrors(next);
      form.querySelector<HTMLElement>(`[name="${Object.keys(next)[0]}"]`)?.focus();
      return;
    }
    setClientErrors({});
    startTransition(() => action(data));
  }

  const field = (name: string) => ({
    "aria-invalid": errors[name] ? (true as const) : undefined,
    "aria-describedby": errors[name] ? `${name}-error` : undefined,
    onChange: () => clearError(name),
  });
  const err = (name: string) =>
    errors[name] ? (
      <p id={`${name}-error`} className="field-error">
        {errors[name]}
      </p>
    ) : null;

  return (
    <form ref={formRef} action={action} onSubmit={onSubmit} onFocusCapture={() => void loadSchema()} noValidate className="space-y-6" aria-describedby="contact-notice">
      {turnstileSiteKey ? <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="lazyOnload" /> : null}

      {state.status === "error" && state.message && !state.fieldErrors ? (
        <p ref={alertRef} tabIndex={-1} role="alert" className="border-l-2 border-wine bg-surface px-4 py-3 text-[0.95rem] text-wine-dark outline-none">
          {state.message}
        </p>
      ) : null}
      {state.status === "error" && state.fieldErrors ? (
        <p role="alert" className="border-l-2 border-wine bg-surface px-4 py-3 text-[0.95rem] text-wine-dark">
          {state.message}
        </p>
      ) : null}

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="field-label">
            Ad Soyad <span aria-hidden="true">*</span>
          </label>
          <input id="name" name="name" type="text" autoComplete="name" required maxLength={CONTACT_LIMITS.name} defaultValue={values.name} className="field-input" {...field("name")} />
          {err("name")}
        </div>
        <div>
          <label htmlFor="email" className="field-label">
            E-posta <span aria-hidden="true">*</span>
          </label>
          <input id="email" name="email" type="email" autoComplete="email" required maxLength={CONTACT_LIMITS.email} defaultValue={values.email} className="field-input" {...field("email")} />
          {err("email")}
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="phone" className="field-label">
            Telefon <span className="font-normal text-quiet">(isteğe bağlı)</span>
          </label>
          <input id="phone" name="phone" type="tel" autoComplete="tel" inputMode="tel" maxLength={CONTACT_LIMITS.phone} defaultValue={values.phone} className="field-input" {...field("phone")} />
          {err("phone")}
        </div>
        <div>
          <label htmlFor="subject" className="field-label">
            Konu <span aria-hidden="true">*</span>
          </label>
          <input id="subject" name="subject" type="text" required maxLength={CONTACT_LIMITS.subject} defaultValue={values.subject} className="field-input" {...field("subject")} />
          {err("subject")}
        </div>
      </div>

      <div>
        <div className="flex items-baseline justify-between gap-4">
          <label htmlFor="message" className="field-label">
            Mesaj <span aria-hidden="true">*</span>
          </label>
          <span className="text-xs text-quiet" aria-hidden="true">
            {count} / {CONTACT_LIMITS.message}
          </span>
        </div>
        <textarea
          id="message"
          name="message"
          rows={7}
          required
          maxLength={CONTACT_LIMITS.message}
          defaultValue={values.message}
          className="field-input min-h-44 resize-y leading-relaxed"
          {...field("message")}
          onChange={(e) => {
            setCount(e.target.value.length);
            clearError("message");
          }}
        />
        {err("message")}
      </div>

      <p id="contact-notice" className="border-l-2 border-wine/60 pl-4 text-[0.9rem] leading-relaxed text-quiet">
        {notice}
      </p>

      <div>
        <div className="flex items-start gap-3">
          <input
            id="consent"
            name="consent"
            type="checkbox"
            defaultChecked={values.consent === "on"}
            required
            className="mt-1 h-5 w-5 shrink-0 accent-wine"
            {...field("consent")}
          />
          <label htmlFor="consent" className="text-[0.95rem] leading-relaxed">
            <ConsentLabel label={consentLabel} /> <span aria-hidden="true">*</span>
          </label>
        </div>
        {err("consent")}
      </div>

      {/* Honeypot: gerçek kullanıcılar görmez ve doldurmaz; dolu gelirse istek bot sayılır. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Web sitesi
          <input type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>
      <input type="hidden" name="startedAt" value={startedAt} />
      {turnstileSiteKey ? <div className="cf-turnstile" data-sitekey={turnstileSiteKey} data-language="tr" /> : null}

      <div className="flex flex-wrap items-center gap-5 pt-2">
        <button type="submit" disabled={pending} className="btn btn-primary min-w-40 disabled:cursor-wait disabled:opacity-70">
          {pending ? "Gönderiliyor…" : "Gönder"}
        </button>
        <p className="text-[0.82rem] text-quiet">
          <span aria-hidden="true">*</span> Zorunlu alan
        </p>
      </div>
    </form>
  );
}
