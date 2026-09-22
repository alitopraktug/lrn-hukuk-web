"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function GlobalRouteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Ayrıntı yalnızca konsolda/sunucu günlüğünde; ziyaretçiye teknik bilgi gösterilmez.
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-[1320px] flex-col justify-center px-5 py-24 sm:px-8 lg:px-12">
      <p className="eyebrow flex items-center gap-4">
        <span aria-hidden="true" className="h-px w-8 bg-wine/60" />
        Hata
      </p>
      <h1 className="display-lg mt-6 max-w-2xl">Bir sorun oluştu.</h1>
      <p className="lead mt-6 max-w-xl">Sayfa şu anda görüntülenemiyor. Lütfen tekrar deneyin; sorun devam ederse daha sonra yeniden ziyaret edin.</p>
      <div className="mt-10 flex flex-wrap gap-3">
        <button type="button" onClick={reset} className="btn btn-primary">
          Tekrar dene
        </button>
        <Link href="/" className="btn btn-outline">
          Ana Sayfa
        </Link>
      </div>
    </div>
  );
}
