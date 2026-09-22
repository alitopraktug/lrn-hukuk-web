import { LegalPage, legalMetadata } from "@/components/pages/legal-page";

export const revalidate = 300;

export const generateMetadata = () => legalMetadata("cookies");

export default function Page() {
  return <LegalPage pageKey="cookies" />;
}
