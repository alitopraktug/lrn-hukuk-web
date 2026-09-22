import Link from "next/link";

/** Giriş, iki adımlı doğrulama ve parola sıfırlama sayfalarının ortak düzeni (oturum gerektirmez). */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
      <div className="flex flex-col justify-between px-6 py-10 sm:px-12 lg:px-20">
        <Link href="/" className="inline-block self-start" aria-label="LRN Hukuk">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo-horizontal.svg" alt="LRN Hukuk" width={170} height={42} className="h-10 w-auto" />
        </Link>
        <main id="icerik" className="mx-auto w-full max-w-md py-12">
          {children}
        </main>
        <p className="text-[0.8rem] text-quiet">Yetkili kullanıcılar içindir. Bu alan arama motorlarına kapalıdır.</p>
      </div>
      <aside aria-hidden="true" className="on-dark relative hidden overflow-hidden bg-forest lg:block">
        {[25, 50, 75].map((p) => (
          <span key={p} className="absolute inset-y-0 w-px bg-background/10" style={{ left: `${p}%` }} />
        ))}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/logo-mark-light.svg" alt="" width={862} height={792} className="absolute -bottom-[6%] -right-[22%] w-[120%] max-w-none opacity-[0.1]" />
        <p className="absolute bottom-10 left-12 text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-background/60">Yönetim Paneli</p>
      </aside>
    </div>
  );
}
