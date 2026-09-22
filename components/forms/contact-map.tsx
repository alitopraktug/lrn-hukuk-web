"use client";

import { useState } from "react";
import type { Locale } from "@/lib/i18n/config";

const COPY = {
  tr: { load: "Haritayı yükle", note: "Harita üçüncü taraf bir hizmetten yüklenir; yükleme sırasında ilgili hizmet çerez kullanabilir.", noEmbed: "Konumu harita uygulamasında görüntüleyebilirsiniz.", open: "Haritada aç", title: "LRN Hukuk konum haritası" },
  en: { load: "Load map", note: "The map is loaded from a third-party service; that service may use cookies once it loads.", noEmbed: "You can view the location in a map application.", open: "Open in maps", title: "LRN Law location map" },
} as const;

/**
 * Gizlilik dostu harita: üçüncü taraf harita çerçevesi, ziyaretçi "Haritayı yükle" düğmesine basana kadar YÜKLENMEZ
 * (böylece Google/OSM'ye istek ve olası çerezler ziyaretçinin açık eylemine bağlıdır).
 */
export function ContactMap({ embedUrl, linkHref, locale = "tr" }: { embedUrl: string | null; linkHref: string | null; locale?: Locale }) {
  const [loaded, setLoaded] = useState(false);
  const c = COPY[locale];

  return (
    <div>
      <div className="relative aspect-[4/3] w-full overflow-hidden border border-line bg-surface sm:aspect-[16/10]">
        {embedUrl && loaded ? (
          <iframe title={c.title} src={embedUrl} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="absolute inset-0 h-full w-full" allowFullScreen />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center">
            <svg aria-hidden="true" viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.2" className="text-wine">
              <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21Z" />
              <circle cx="12" cy="9.5" r="2.5" />
            </svg>
            {embedUrl ? (
              <>
                <button type="button" onClick={() => setLoaded(true)} className="btn btn-outline">
                  {c.load}
                </button>
                <p className="max-w-xs text-[0.8rem] leading-relaxed text-quiet">{c.note}</p>
              </>
            ) : (
              <p className="text-[0.9rem] text-quiet">{c.noEmbed}</p>
            )}
          </div>
        )}
      </div>
      {linkHref ? (
        <a href={linkHref} target="_blank" rel="noopener noreferrer" className="link-arrow mt-4">
          {c.open}
          <svg aria-hidden="true" viewBox="0 0 24 12" width="22" height="11" fill="none" stroke="currentColor" strokeWidth="1.25">
            <path d="M0 6h22M17 1l5 5-5 5" />
          </svg>
        </a>
      ) : null}
    </div>
  );
}
