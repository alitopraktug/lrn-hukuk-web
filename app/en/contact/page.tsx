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
    { title: "Contact", description: `${s.firmName} contact details, address and contact form. Ankara.`, path: "/en/contact", locale: "en", alternatePath: "/iletisim" },
    s,
  );
}

export default async function EnglishContactPage() {
  const s = await getSiteSettings();
  const embed = safeMapEmbedUrl(s.mapEmbedUrl);
  const hasDetails = Boolean(s.address || s.phone || s.email || s.workingHours);
  const rows: { label: string; node: React.ReactNode }[] = [];
  if (s.address) rows.push({ label: "Address", node: <span className="whitespace-pre-line">{s.address}</span> });
  if (s.phone)
    rows.push({
      label: "Phone",
      node: (
        <a href={telHref(s.phone)} className="hover:text-wine">
          {s.phone}
        </a>
      ),
    });
  if (s.email)
    rows.push({
      label: "Email",
      node: (
        <a href={`mailto:${s.email}`} className="hover:text-wine">
          {s.email}
        </a>
      ),
    });
  if (s.workingHours) rows.push({ label: "Office hours", node: <span className="whitespace-pre-line">{s.workingHours}</span> });

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Contact"
        lead="For general enquiries and to get in touch, you can use the details below or the contact form."
        locale="en"
        crumbs={[{ name: "Contact", path: "/en/contact" }]}
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
                <p className="mt-6 text-[1.02rem] leading-relaxed text-quiet">You can use the contact form on the right to reach our firm.</p>
              )}

              {embed || s.address ? (
                <div className="mt-10">
                  <ContactMap embedUrl={embed} linkHref={s.address ? mapsSearchUrl(`${s.address}, Ankara`) : null} locale="en" />
                </div>
              ) : null}
            </div>

            <div className="col-span-12 lg:col-span-7">
              <h2 className="display-md mb-8">Contact Form</h2>
              <ContactForm
                notice={s.contactNotice}
                consentLabel={s.contactConsentLabel}
                turnstileSiteKey={env.turnstileSiteKey && env.turnstileSecret ? env.turnstileSiteKey : undefined}
                locale="en"
              />
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
