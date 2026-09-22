"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { UI, localizePath, toTrPath, type Locale } from "@/lib/i18n/config";

function navItems(locale: Locale) {
  const t = UI[locale].nav;
  return [
    { href: localizePath("/", locale), label: t.home },
    { href: localizePath("/hakkimizda", locale), label: t.about },
    { href: localizePath("/ekibimiz", locale), label: t.team },
    { href: localizePath("/calisma-alanlari", locale), label: t.areas },
    { href: localizePath("/yayinlar", locale), label: t.publications },
    { href: localizePath("/iletisim", locale), label: t.contact },
  ];
}

function isActive(pathname: string, href: string) {
  return href === "/" || href === "/en" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Sade, yapışkan gezinme. Sayfa başında saydam (hero ile kaynaşır); kaydırılınca ivory zemin +
 * ince alt çizgi belirir. Bulanıklık/cam efekti yok. `locale` verilirse ("en") menü metinleri ve
 * bağlantılar İngilizceye döner; sağda TR/EN dil değiştirici, aynı sayfanın diğer dildeki
 * karşılığına gider (bkz. lib/i18n/config.ts). Mobil menü, yerel <dialog> ile yapılır: odak
 * tuzağı, Esc ile kapanma, arka planı devre dışı bırakma ve odağı tetikleyiciye geri verme
 * tarayıcı tarafından sağlanır; gövde kaydırması CSS ile kilitlenir (globals.css).
 */
export function Header({
  logo,
  menuLogo,
  contact,
  locale = "tr",
}: {
  logo: ReactNode;
  menuLogo: ReactNode;
  contact: { phone: string; email: string };
  locale?: Locale;
}) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const t = UI[locale];
  const items = navItems(locale);
  const otherLocale: Locale = locale === "tr" ? "en" : "tr";
  const otherHref = locale === "tr" ? localizePath(pathname, "en") : toTrPath(pathname);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setScrolled(!entry.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Sayfa değişince menüyü kapat
  useEffect(() => {
    dialogRef.current?.close();
  }, [pathname]);

  // Geniş ekrana geçilince menüyü kapat
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = () => mq.matches && dialogRef.current?.close();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return (
    <>
      <div ref={sentinelRef} aria-hidden="true" className="pointer-events-none absolute left-0 top-px h-px w-full" />
      <header
        data-site-header
        data-scrolled={scrolled || undefined}
        className={cn(
          "sticky top-0 z-40 w-full border-b transition-[background-color,border-color] duration-300",
          scrolled ? "border-line bg-background" : "border-transparent bg-transparent",
        )}
      >
        <div className="mx-auto flex h-16 w-full max-w-[1380px] items-center justify-between gap-6 px-5 sm:px-8 md:h-[var(--header-h)] lg:px-12">
          <Link href={localizePath("/", locale)} aria-label="LRN Hukuk" className="-ml-1 flex shrink-0 items-center p-1">
            {logo}
          </Link>

          <div className="hidden items-center gap-8 lg:flex xl:gap-10">
            <nav aria-label={locale === "tr" ? "Ana gezinme" : "Main navigation"}>
              <ul className="flex items-center gap-8 xl:gap-10">
                {items.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="nav-link" aria-current={isActive(pathname, item.href) ? "page" : undefined}>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <LangSwitch locale={locale} otherLocale={otherLocale} otherHref={otherHref} />
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <LangSwitch locale={locale} otherLocale={otherLocale} otherHref={otherHref} compact />
            <button
              type="button"
              className="-mr-2 flex h-11 items-center gap-3 px-2 text-[0.8rem] font-semibold uppercase tracking-[0.14em]"
              aria-haspopup="dialog"
              aria-expanded={open}
              aria-controls="mobile-menu"
              onClick={() => {
                dialogRef.current?.showModal();
                setOpen(true);
              }}
            >
              <span>{t.menuOpen}</span>
              <span aria-hidden="true" className="flex w-6 flex-col gap-[6px]">
                <span className="block h-px w-full bg-current" />
                <span className="block h-px w-4/6 self-end bg-current" />
              </span>
            </button>
          </div>
        </div>
      </header>

      <dialog
        id="mobile-menu"
        ref={dialogRef}
        aria-label={t.menuOpen}
        onClose={() => setOpen(false)}
        onClick={(e) => {
          if (e.target === dialogRef.current) dialogRef.current?.close();
        }}
        className="m-0 h-dvh max-h-none w-full max-w-none flex-col bg-background p-0 text-foreground open:flex"
      >
        <div className="mx-auto flex h-16 w-full max-w-[1380px] shrink-0 items-center justify-between px-5 sm:px-8">
          <Link href={localizePath("/", locale)} className="-ml-1 flex items-center p-1" onClick={() => dialogRef.current?.close()} aria-label="LRN Hukuk">
            {menuLogo}
          </Link>
          <button
            type="button"
            autoFocus
            className="-mr-2 flex h-11 items-center gap-3 px-2 text-[0.8rem] font-semibold uppercase tracking-[0.14em]"
            onClick={() => dialogRef.current?.close()}
          >
            <span>{t.menuClose}</span>
            <svg aria-hidden="true" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.25">
              <path d="M5 5l14 14M19 5L5 19" />
            </svg>
          </button>
        </div>

        <nav aria-label={locale === "tr" ? "Mobil gezinme" : "Mobile navigation"} className="mx-auto flex w-full max-w-[1380px] flex-1 flex-col justify-center overflow-y-auto px-5 py-8 sm:px-8">
          <ul className="divide-y divide-line border-y border-line">
            {items.map((item, i) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => dialogRef.current?.close()}
                  aria-current={isActive(pathname, item.href) ? "page" : undefined}
                  className="flex items-baseline gap-5 py-4 font-serif text-[1.9rem] leading-tight transition-colors hover:text-wine aria-[current=page]:text-wine sm:text-4xl"
                >
                  <span className="index-num w-6 shrink-0 text-base">{String(i + 1).padStart(2, "0")}</span>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {contact.phone || contact.email ? (
          <div className="mx-auto w-full max-w-[1380px] shrink-0 px-5 pb-8 text-sm text-quiet sm:px-8">
            {contact.phone ? (
              <a href={`tel:${contact.phone.replace(/[^\d+]/g, "")}`} className="mr-6 inline-block py-1 hover:text-wine">
                {contact.phone}
              </a>
            ) : null}
            {contact.email ? (
              <a href={`mailto:${contact.email}`} className="inline-block py-1 hover:text-wine">
                {contact.email}
              </a>
            ) : null}
          </div>
        ) : null}
      </dialog>
    </>
  );
}

const LOCALE_LABEL: Record<Locale, string> = { tr: "TR", en: "EN" };

/** Küçük TR/EN dil değiştirici — aynı sayfanın diğer dildeki karşılığına gider. */
function LangSwitch({ locale, otherLocale, otherHref, compact }: { locale: Locale; otherLocale: Locale; otherHref: string; compact?: boolean }) {
  return (
    <Link
      href={otherHref}
      aria-label={`${UI[locale].languageSwitch}: ${LOCALE_LABEL[otherLocale]}`}
      className={cn(
        "inline-flex items-center gap-1 text-[0.78rem] font-semibold tracking-[0.06em] text-quiet transition-colors hover:text-wine",
        compact && "px-1",
      )}
    >
      <span className="text-foreground">{LOCALE_LABEL[locale]}</span>
      <span aria-hidden="true" className="text-line">
        /
      </span>
      <span>{LOCALE_LABEL[otherLocale]}</span>
    </Link>
  );
}
