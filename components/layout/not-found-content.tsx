import { Container, ButtonLink } from "@/components/ui/primitives";

export function NotFoundContent() {
  return (
    <Container className="py-24 sm:py-32 lg:py-40">
      <div className="grid grid-cols-12 md:gap-x-8">
        <div className="col-span-12 lg:col-span-8">
          <p className="eyebrow flex items-center gap-4">
            <span aria-hidden="true" className="h-px w-8 bg-wine/60" />
            404
          </p>
          <h1 className="display-xl mt-6">Aradığınız sayfa bulunamadı.</h1>
          <p className="lead mt-7 max-w-xl">Bağlantı değişmiş ya da sayfa kaldırılmış olabilir. Ana sayfadan devam edebilirsiniz.</p>
          <div className="mt-10">
            <ButtonLink href="/" variant="primary" arrow>
              Ana Sayfa
            </ButtonLink>
          </div>
        </div>
      </div>
    </Container>
  );
}
