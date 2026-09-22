import { Container, Section } from "@/components/ui/primitives";

/** Sade iskelet: dönen ikon yok, yerleşim korunur (CLS yok). */
export default function Loading() {
  return (
    <Section bordered={false} className="!pt-24">
      <Container>
        <div aria-busy="true" aria-live="polite" className="animate-pulse">
          <span className="sr-only">Yayınlar yükleniyor…</span>
          <div className="h-4 w-32 bg-stone/40" />
          <div className="mt-6 h-16 w-2/3 bg-stone/30" />
          <div className="mt-16 grid gap-10 md:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="border-t border-foreground/20 pt-5">
                <div className="h-3 w-24 bg-stone/40" />
                <div className="mt-4 h-8 w-5/6 bg-stone/30" />
                <div className="mt-4 h-4 w-full bg-stone/25" />
                <div className="mt-2 h-4 w-4/5 bg-stone/25" />
              </div>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}
