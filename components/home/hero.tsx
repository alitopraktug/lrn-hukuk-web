import { ButtonLink, Emphasis, LinkArrow } from "@/components/ui/primitives";

/**
 * Ana sayfa kapağı — editoryal, mimari. Klişe hukuk görselleri (terazi/tokmak/Themis) yerine;
 * solda büyük serif başlık + ölçülü CTA'lar, sağda kenardan kenara (edge-to-edge) soyut mimari
 * panel (gerçek ofis/mimari fotoğrafı eklenene kadarki yer tutucu — bkz. README).
 * Alt kısımda ince bir çizgi ve bölüm numarası (01), site boyunca süren görsel imza.
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
    <section aria-labelledby="hero-title" className="relative border-b border-line">
      <div className="grid grid-cols-1 lg:grid-cols-[52fr_48fr] lg:items-stretch">
        <div className="order-2 flex min-h-[auto] flex-col justify-center px-5 pb-16 pt-10 sm:px-8 sm:pb-20 sm:pt-14 lg:order-1 lg:min-h-[82vh] lg:px-12 lg:py-24 xl:pl-16">
          <div className="mx-auto w-full max-w-[620px] lg:mx-0 lg:max-w-[560px]">
            <p className="eyebrow rise">{eyebrow}</p>
            <h1 id="hero-title" className="display-xl rise mt-6 sm:mt-8" style={{ ["--d" as string]: "70ms" }}>
              <Emphasis text={title} />
            </h1>
            <p className="lead rise mt-7 max-w-[46ch] sm:mt-8" style={{ ["--d" as string]: "140ms" }}>
              {lead}
            </p>
            <div className="rise mt-9 flex flex-wrap items-center gap-x-7 gap-y-4 sm:mt-11" style={{ ["--d" as string]: "210ms" }}>
              <ButtonLink href="/calisma-alanlari" variant="primary">
                {primaryLabel}
              </ButtonLink>
              <LinkArrow href="/hakkimizda">{secondaryLabel}</LinkArrow>
            </div>
          </div>
        </div>

        <div className="relative order-1 aspect-[5/4] w-full sm:aspect-[16/10] lg:order-2 lg:aspect-auto">
          <ArchitecturalPanel />
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-[1380px] items-center justify-between px-5 py-3 text-[0.72rem] tracking-[0.08em] text-quiet sm:px-8 lg:px-12 xl:px-16">
        <span className="hidden sm:inline">LRN Hukuk</span>
        <span className="index-num">01</span>
      </div>
    </section>
  );
}

/**
 * Gerçek ofis/mimari fotoğrafı gelene kadarki yer tutucu: ince çizgi ızgarası + mimari kesit
 * hissi veren tek bir açılı çizgi + silik monogram + "Ankara" etiketi. Stok görsel değil, sahte
 * fotoğraf da değil — bilinçli olarak soyut bir yer tutucu bileşendir (bkz. README).
 */
function ArchitecturalPanel() {
  return (
    <div aria-hidden="true" className="on-dark absolute inset-0 overflow-hidden bg-ink text-background">
      <svg className="absolute inset-0 h-full w-full opacity-[0.5]" preserveAspectRatio="none" viewBox="0 0 100 100">
        <line x1="0" y1="100" x2="100" y2="18" stroke="currentColor" strokeWidth="0.15" />
        <line x1="0" y1="72" x2="100" y2="0" stroke="currentColor" strokeWidth="0.15" />
        <line x1="22" y1="0" x2="22" y2="100" stroke="currentColor" strokeWidth="0.08" />
        <line x1="60" y1="0" x2="60" y2="100" stroke="currentColor" strokeWidth="0.08" />
      </svg>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/logo-mark-light.svg"
        alt=""
        width={862}
        height={792}
        className="absolute -bottom-[10%] -right-[18%] w-[78%] max-w-[640px] opacity-[0.07]"
      />
      <div className="absolute left-6 top-6 flex items-center gap-3 sm:left-8 sm:top-8">
        <span className="h-px w-8 bg-background/40" />
        <span className="text-[0.66rem] font-semibold uppercase tracking-[0.26em] text-background/60">LRN Hukuk</span>
      </div>
      <div className="absolute bottom-6 left-6 sm:bottom-8 sm:left-8">
        <p className="text-[0.66rem] font-semibold uppercase tracking-[0.26em] text-background/55">Ankara</p>
        <p className="mt-2 font-serif text-[1.3rem] leading-none text-background/85">39°55′ K · 32°51′ D</p>
      </div>
    </div>
  );
}
