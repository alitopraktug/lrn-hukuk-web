"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  CONSENT_EVENT,
  GA_ID_PATTERN,
  OPEN_CONSENT_EVENT,
  disableGoogleAnalytics,
  loadGoogleAnalytics,
  readConsent,
  writeConsent,
} from "@/lib/consent";

/**
 * Çerez tercihi. Yalnızca zorunlu çerezler kullanılıyorsa (GA tanımlı değilse) HİÇBİR banner gösterilmez.
 * GA tanımlıysa: karar verilene dek analitik yüklenmez; "Yalnızca zorunlu" ile "Kabul et" eşit görünürlüktedir;
 * tercih, sayfa altındaki "Çerez Tercihleri" bağlantısından her zaman değiştirilebilir.
 */
export function ConsentManager({ gaId }: { gaId: string | null }) {
  const enabled = Boolean(gaId && GA_ID_PATTERN.test(gaId));
  const [ready, setReady] = useState(false);
  const [decided, setDecided] = useState(true);
  const [analytics, setAnalytics] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const apply = useCallback(
    (allow: boolean) => {
      if (!gaId) return;
      if (allow) loadGoogleAnalytics(gaId);
      else disableGoogleAnalytics(gaId);
    },
    [gaId],
  );

  // İlk yüklemede kayıtlı tercihi oku (yalnızca istemcide — sunucu HTML'i tercihten bağımsız kalır).
  useEffect(() => {
    if (!enabled) return;
    const saved = readConsent();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDecided(Boolean(saved));
    setAnalytics(saved?.analytics ?? false);
    setReady(true);
    if (saved?.analytics) apply(true);
  }, [enabled, apply]);

  // Sayfa altındaki "Çerez Tercihleri" bağlantısı
  useEffect(() => {
    if (!enabled) return;
    const open = () => {
      setAnalytics(readConsent()?.analytics ?? false);
      dialogRef.current?.showModal();
    };
    window.addEventListener(OPEN_CONSENT_EVENT, open);
    return () => window.removeEventListener(OPEN_CONSENT_EVENT, open);
  }, [enabled]);

  const choose = (allow: boolean) => {
    writeConsent(allow);
    setAnalytics(allow);
    setDecided(true);
    apply(allow);
    dialogRef.current?.close();
  };

  if (!enabled || !ready) return null;

  return (
    <div data-consent>
      {!decided ? (
        <section
          aria-label="Çerez tercihleri"
          className="fixed inset-x-3 bottom-3 z-50 border border-line bg-surface p-5 shadow-soft sm:inset-x-auto sm:bottom-6 sm:left-6 sm:max-w-md sm:p-6"
        >
          <p className="font-serif text-xl leading-snug">Çerez tercihleriniz</p>
          <p className="mt-2 text-sm leading-relaxed text-quiet">
            Sitenin çalışması için gerekli çerezler her zaman kullanılır. İsterseniz, ziyaretçi istatistiklerini toplu olarak anlamamıza yardımcı olan analitik çerezlere de izin verebilirsiniz.{" "}
            <Link href="/cerez-politikasi" className="text-forest underline underline-offset-4">
              Çerez Politikası
            </Link>
          </p>
          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            <button type="button" onClick={() => choose(false)} className="btn btn-outline min-h-11 flex-1 px-4 py-2.5 text-[0.72rem]">
              Yalnızca zorunlu
            </button>
            <button type="button" onClick={() => choose(true)} className="btn btn-primary min-h-11 flex-1 px-4 py-2.5 text-[0.72rem]">
              Kabul et
            </button>
          </div>
          <button
            type="button"
            onClick={() => dialogRef.current?.showModal()}
            className="mt-3 text-sm text-quiet underline underline-offset-4 hover:text-forest"
          >
            Tercihleri yönet
          </button>
        </section>
      ) : null}

      <dialog
        ref={dialogRef}
        aria-labelledby="consent-title"
        className="m-auto w-[min(92vw,34rem)] max-w-none border border-line bg-surface p-0 text-foreground shadow-soft backdrop:bg-ink/50"
        onClick={(e) => {
          if (e.target === dialogRef.current) dialogRef.current?.close();
        }}
      >
        <form
          method="dialog"
          className="p-6 sm:p-8"
          onSubmit={(e) => {
            e.preventDefault();
            choose(analytics);
          }}
        >
          <div className="flex items-start justify-between gap-4">
            <h2 id="consent-title" className="font-serif text-2xl">
              Çerez tercihleri
            </h2>
            <button type="button" onClick={() => dialogRef.current?.close()} aria-label="Kapat" className="-m-2 p-2 text-quiet hover:text-foreground">
              <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M5 5l14 14M19 5L5 19" />
              </svg>
            </button>
          </div>
          <p className="mt-2 text-sm text-quiet">İzin vermediğiniz kategoriler çalışmaz. Tercihinizi dilediğiniz zaman değiştirebilirsiniz.</p>

          <div className="mt-6 divide-y divide-line border-y border-line">
            <div className="flex items-start justify-between gap-6 py-4">
              <div>
                <p className="font-semibold">Zorunlu</p>
                <p className="mt-1 text-sm text-quiet">Sitenin çalışması ve tercihinizin hatırlanması için gereklidir. Kapatılamaz.</p>
              </div>
              <span className="mt-1 shrink-0 text-xs font-semibold uppercase tracking-widest text-quiet">Her zaman açık</span>
            </div>
            <div className="flex items-start justify-between gap-6 py-4">
              <div>
                <label htmlFor="consent-analytics" className="font-semibold">
                  Analitik
                </label>
                <p className="mt-1 text-sm text-quiet">Ziyaretçi sayısı ve sayfa kullanımı gibi istatistikleri toplu olarak ölçmek için Google Analytics kullanılır.</p>
              </div>
              <label className="relative mt-1 inline-flex h-7 w-12 shrink-0 cursor-pointer items-center">
                <input
                  id="consent-analytics"
                  type="checkbox"
                  role="switch"
                  checked={analytics}
                  onChange={(e) => setAnalytics(e.target.checked)}
                  className="peer sr-only"
                />
                <span aria-hidden="true" className="absolute inset-0 rounded-full bg-stone/60 transition-colors peer-checked:bg-forest peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-wine" />
                <span aria-hidden="true" className="absolute left-1 h-5 w-5 rounded-full bg-white transition-transform peer-checked:translate-x-5" />
              </label>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button type="button" onClick={() => choose(false)} className="btn btn-outline px-5">
              Yalnızca zorunlu
            </button>
            <button type="submit" className="btn btn-primary px-5">
              Tercihimi kaydet
            </button>
          </div>
        </form>
      </dialog>
    </div>
  );
}

/** Sayfa altındaki "Çerez Tercihleri" bağlantısı (yalnızca analitik yapılandırılmışsa gösterilir). */
export function CookiePreferencesButton({ gaId, className }: { gaId: string | null; className?: string }) {
  if (!gaId || !GA_ID_PATTERN.test(gaId)) return null;
  return (
    <button type="button" className={className} onClick={() => window.dispatchEvent(new Event(OPEN_CONSENT_EVENT))}>
      Çerez Tercihleri
    </button>
  );
}

export { CONSENT_EVENT };
