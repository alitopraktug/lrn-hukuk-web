import { LegalPage, legalMetadata } from "@/components/pages/legal-page";

export const revalidate = 300;

export const generateMetadata = () => legalMetadata("kvkk");

export default function Page() {
  return <LegalPage pageKey="kvkk" />;
}
