import { useTranslations } from "next-intl";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SmoothScroll from "@/components/layout/SmoothScroll";
import CartDrawer from "@/components/cart/CartDrawer";
import FloatingCartTab from "@/components/cart/FloatingCartTab";
import JsonLd from "@/components/seo/JsonLd";
import { siteConfig } from "@/lib/site";

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  const t = useTranslations("Common");
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
  const b = siteConfig.business;

  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.logoText,
    url: base,
    email: b.email,
    telephone: b.tel,
    address: { "@type": "PostalAddress", streetAddress: b.address, addressCountry: "KR" },
  };

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.logoText,
    url: base,
    potentialAction: {
      "@type": "SearchAction",
      target: `${base}/product-list?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      <SmoothScroll />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:text-white"
      >
        {t("skipToContent")}
      </a>
      <JsonLd data={organization} />
      <JsonLd data={website} />
      <AnnouncementBar />
      <Header />
      <main id="main">{children}</main>
      <Footer />
      <CartDrawer />
      <FloatingCartTab />
    </>
  );
}