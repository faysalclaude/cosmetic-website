import FaqPage from "@/components/pages/FaqPage";
import { siteMetadata } from "@/components/pages/SitePage";

export const revalidate = 60;
export const generateMetadata = siteMetadata("faq");

export default function Page() {
  return <FaqPage />;
}