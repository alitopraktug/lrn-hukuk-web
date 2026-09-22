import { Container, ButtonLink, Emphasis } from "@/components/ui/primitives";

/**
 * Ana sayfa kapağı: klişe hukuk görselleri yerine editoryal tipografi + soyut "kimlik plakası".
 * Plaka; marka yeşili zemin, ince dikey çizgiler ve monogramın büyük, silik bir kesitinden oluşur.
 * Ankara'nın gerçek koordinatları (39°55′K · 32°51′D) mimari bir çizim etiketi gibi kullanılır.
 */
export function Hero({
  eyebrow,
  title,
  lead,
  primaryLabel,
  secondaryLabel,
}: {
  eyebrow: string;
  title: string;
  lead: string;
  primaryLabel: string;
  secondaryLabel: string;
}) {
  return (
    <section aria-labelledby="hero-title" className="relative overflow-hidden">
      {/* İnce dikey kılavuz çizgileri — sitenin ızgara imzası */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden lg:block">
        <div className="mx-auto h-full w-full max-w-[1320px] px-12">
          <div className="grid h-full grid-cols-4 border-x border-line/0">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="border-l border-line/70 last:border-r" />
            ))}
          </div>
        </div>
      </div>

      <Container className="relative">
        <div className="grid min-h-[max(70vh,32rem)] grid-cols-12 items-center md:gap-x-8 gap-y-12 py-14 sm:py-20 lg:min-h-[max(78vh,40rem)] lg:py-24">
          <div className="col-span-12 lg:col-span-7">
            <p className="eyebrow rise">{eyebrow}</p>
            <h1 id="hero-title" className="display-xl mt-7 max-w-[15em] sm:mt-9">
              <Emphasis text={title} />
            </h1>
            <p className="lead rise mt-8 max-w-xl" style={{ ["--d" as string]: "120ms" }}>
              {lead}
            </p>
            <div className="rise mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4" style={{ ["--d" as string]: "220ms" }}>
              <ButtonLink href="/calisma-alanlari" variant="primary" arrow>
                {primaryLabel}
              </ButtonLink>
              <ButtonLink href="/iletisim" variant="outline">
                {secondaryLabel}
              </ButtonLink>
            </div>
          </div>

          <div className="rise col-span-12 hidden lg:col-span-5 lg:block" style={{ ["--d" as string]: "160ms" }}>
            <IdentityPlate />
          </div>
        </div>
      </Container>
    </section>
  );
}

function IdentityPlate() {
  return (
    <div aria-hidden="true" className="on-dark relative ml-auto aspect-[4/5] w-full max-w-[440px] overflow-hidden bg-forest text-background">
      {[25, 50, 75].map((p) => (
        <span key={p} className="absolute inset-y-0 w-px bg-background/[0.09]" style={{ left: `${p}%` }} />
      ))}
      <span className="absolute inset-x-0 top-[62%] h-px bg-background/[0.09]" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/logo-mark-light.svg"
        alt=""
        width={862}
        height={792}
        className="absolute -bottom-[7%] -right-[16%] w-[96%] max-w-none opacity-[0.11]"
      />
      <div className="absolute left-7 top-7 flex items-center gap-3">
        <span className="h-px w-8 bg-background/40" />
        <span className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-background/65">LRN</span>
      </div>
      <div className="absolute bottom-7 left-7 right-7">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-background/60">Ankara</p>
        <p className="mt-2 font-serif text-[1.35rem] leading-none text-background/90">39°55′ K · 32°51′ D</p>
      </div>
    </div>
  );
}
