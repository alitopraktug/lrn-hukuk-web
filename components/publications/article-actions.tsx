"use client";

import { useState } from "react";
import type { Locale } from "@/lib/i18n/config";

const btn =
  "inline-flex min-h-11 items-center gap-2 border border-line px-4 py-2 text-[0.78rem] font-semibold uppercase tracking-[0.1em] transition-colors hover:border-wine hover:text-wine";

const COPY = {
  tr: { copy: "Bağlantıyı Kopyala", print: "Yazdır", prompt: "Bağlantıyı kopyalayın:", done: "Bağlantı kopyalandı." },
  en: { copy: "Copy Link", print: "Print", prompt: "Copy this link:", done: "Link copied." },
} as const;

/** Makale paylaşımı bilinçli olarak minimal tutulur: yalnızca bağlantıyı kopyalama ve yazdırma. */
export function ArticleActions({ locale = "tr" }: { locale?: Locale }) {
  const [copied, setCopied] = useState(false);
  const c = COPY[locale];

  async function copy() {
    try {
      await navigator.clipboard.writeText(window.location.href.split("#")[0]);
    } catch {
      window.prompt(c.prompt, window.location.href);
      return;
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2500);
  }

  return (
    <div className="no-print flex flex-wrap gap-3">
      <button type="button" onClick={copy} className={btn}>
        {c.copy}
      </button>
      <button type="button" onClick={() => window.print()} className={btn}>
        {c.print}
      </button>
      <span role="status" aria-live="polite" className="basis-full text-sm text-wine">
        {copied ? c.done : ""}
      </span>
    </div>
  );
}
