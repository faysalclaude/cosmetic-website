import { SitePage, siteMetadata } from "@/components/pages/SitePage";

export const revalidate = 60;
export const generateMetadata = siteMetadata("privacy-policy");

export default function PrivacyPage() {
  return <SitePage slug="privacy-policy" />;
}