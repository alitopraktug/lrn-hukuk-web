"use client";

import { useState } from "react";

const btn =
  "inline-flex min-h-11 items-center gap-2 border border-line px-4 py-2 text-[0.78rem] font-semibold uppercase tracking-[0.1em] transition-colors hover:border-forest hover:text-forest";

/** Makale paylaşımı bilinçli olarak minimal tutulur: yalnızca bağlantıyı kopyalama ve yazdırma. */
export function ArticleActions() {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(window.location.href.split("#")[0]);
    } catch {
      window.prompt("Bağlantıyı kopyalayın:", window.location.href);
      return;
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2500);
  }

  return (
    <div className="no-print flex flex-wrap gap-3">
      <button type="button" onClick={copy} className={btn}>
        Bağlantıyı Kopyala
      </button>
      <button type="button" onClick={() => window.print()} className={btn}>
        Yazdır
      </button>
      <span role="status" aria-live="polite" className="basis-full text-sm text-forest">
        {copied ? "Bağlantı kopyalandı." : ""}
      </span>
    </div>
  );
}
