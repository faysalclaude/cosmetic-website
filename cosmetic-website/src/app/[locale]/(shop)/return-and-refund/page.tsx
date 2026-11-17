import { SitePage, siteMetadata } from "@/components/pages/SitePage";

export const revalidate = 60;
export const generateMetadata = siteMetadata("return-and-refund");

export default function RefundPage() {
  return <SitePage slug="return-and-refund" />;
}