import { SitePage, siteMetadata } from "@/components/pages/SitePage";

export const revalidate = 60;
export const generateMetadata = siteMetadata("terms-and-services");

export default function TermsPage() {
  return <SitePage slug="terms-and-services" />;
}