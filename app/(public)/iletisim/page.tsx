import type { Metadata } from "next";
import { ContactForm } from "@/components/forms/contact-form";
import { ContactMap } from "@/components/forms/contact-map";
import { PageHero } from "@/components/layout/page-hero";
import { Container, Section } from "@/components/ui/primitives";
import { env } from "@/lib/env";
import { getSiteSettings } from "@/lib/data/site";
import { mapsSearchUrl, safeMapEmbedUrl } from "@/lib/map";
import { buildMetadata } from "@/lib/seo";
import { telHref } from "@/lib/utils";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettings();
  return buildMetadata(
    { title: "İletişim", description: `${s.firmName} iletişim bilgileri, adres ve iletişim formu. Ankara.`, path: "/iletisim" },
    s,
  );
}

export default async function ContactPage() {
  const s = await getSiteSettings();
  const embed = safeMapEmbedUrl(s.mapEmbedUrl);
  const hasDetails = Boolean(s.address || s.phone || s.email || s.workingHours);
  const rows: { label: string; node: React.ReactNode }[] = [];
  if (s.address) rows.push({ label: "Adres", node: <span className="whitespace-pre-line">{s.address}</span> });
  if (s.phone)
    rows.push({
      label: "Telefon",
      node: (
        <a href={telHref(s.phone)} className="hover:text-wine">
          {s.phone}
        </a>
      ),
    });
  if (s.email)
    rows.push({
      label: "E-posta",
      node: (
        <a href={`mailto:${s.email}`} className="hover:text-wine">
          {s.email}
        </a>
      ),
    });
  if (s.workingHours) rows.push({ label: "Çalışma saatleri", node: <span className="whitespace-pre-line">{s.workingHours}</span> });

  return (
    <>
      <PageHero
        eyebrow="İletişim"
        title="İletişim"
        lead="Genel bilgi talepleriniz ve iletişim için aşağıdaki bilgileri veya iletişim formunu kullanabilirsiniz."
        crumbs={[{ name: "İletişim", path: "/iletisim" }]}
      />

      <Section bordered={false} className="!pt-14 sm:!pt-16 lg:!pt-20">
        <Container>
          <div className="grid grid-cols-12 md:gap-x-10 gap-y-16">
            <div className="col-span-12 lg:col-span-5">
              <h2 className="display-md">{s.firmName}</h2>
              {hasDetails ? (
                <dl className="mt-8 divide-y divide-line border-y border-line">
                  {rows.map((r) => (
                    <div key={r.label} className="grid gap-1 py-5 sm:grid-cols-[9rem_1fr] sm:gap-6">
                      <dt className="eyebrow !text-quiet">{r.label}</dt>
                      <dd className="text-[1.02rem] leading-relaxed">{r.node}</dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p className="mt-6 text-[1.02rem] leading-relaxed text-quiet">Büroya ulaşmak için sağdaki iletişim formunu kullanabilirsiniz.</p>
              )}

              {embed || s.address ? (
                <div className="mt-10">
                  <ContactMap embedUrl={embed} linkHref={s.address ? mapsSearchUrl(`${s.address}, Ankara`) : null} />
                </div>
              ) : null}
            </div>

            <div className="col-span-12 lg:col-span-7">
              <h2 className="display-md mb-8">İletişim Formu</h2>
              <ContactForm notice={s.contactNotice} consentLabel={s.contactConsentLabel} turnstileSiteKey={env.turnstileSiteKey && env.turnstileSecret ? env.turnstileSiteKey : undefined} />
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
