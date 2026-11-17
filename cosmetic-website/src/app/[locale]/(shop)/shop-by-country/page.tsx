import { SitePage, siteMetadata } from "@/components/pages/SitePage";

export const revalidate = 60;
export const generateMetadata = siteMetadata("shop-by-country");

export default function ShopByCountryPage() {
  return <SitePage slug="shop-by-country" />;
}