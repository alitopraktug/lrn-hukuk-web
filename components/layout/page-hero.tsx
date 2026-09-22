import type { ReactNode } from "react";
import { Breadcrumb } from "@/components/ui/seo-blocks";
import { Container } from "@/components/ui/primitives";
import type { Crumb } from "@/lib/jsonld";

/** İç sayfa başlığı: sayfa yolu + eyebrow + H1 + giriş metni. Sayfanın tek H1'i burada üretilir. */
export function PageHero({
  eyebrow,
  title,
  lead,
  crumbs,
  children,
}: {
  eyebrow?: string;
  title: ReactNode;
  lead?: ReactNode;
  crumbs?: Crumb[];
  children?: ReactNode;
}) {
  return (
    <header className="relative border-b border-line">
      <Container className="pb-14 pt-8 sm:pb-16 sm:pt-10 lg:pb-24">
        {crumbs?.length ? <Breadcrumb items={crumbs} /> : <div className="h-5" />}
        <div className="mt-10 grid grid-cols-12 md:gap-x-8 sm:mt-14 lg:mt-20">
          <div className="col-span-12 lg:col-span-10 xl:col-span-9">
            {eyebrow ? (
              <p className="eyebrow rise flex items-center gap-4">
                <span aria-hidden="true" className="h-px w-8 bg-wine/60" />
                {eyebrow}
              </p>
            ) : null}
            <h1 className="display-xl mt-6 max-w-[16em]">{title}</h1>
            {lead ? (
              <p className="lead rise mt-7 max-w-2xl" style={{ ["--d" as string]: "100ms" }}>
                {lead}
              </p>
            ) : null}
            {children}
          </div>
        </div>
      </Container>
    </header>
  );
}
