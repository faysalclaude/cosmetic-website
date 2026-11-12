import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { products } from "@/lib/products";
import { siteConfig } from "@/lib/site";
import { loc } from "@/lib/utils";
import ProductDetailView from "@/components/product/ProductDetailView";

type Params = Promise<{ locale: string; slug: string }>;

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    products.map((p) => ({ locale, slug: p.slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const product = products.find((p) => p.slug === slug);
  if (!product) return {};

  const name = loc(product.name, locale);
  const description = loc(product.summary, locale).slice(0, 155);
  const path = `/product/${slug}`;

  return {
    title: name,
    description,
    alternates: {
      canonical: locale === "en" ? `/en${path}` : path,
      languages: { ko: path, en: `/en${path}` },
    },
    openGraph: {
      title: name,
      description,
      type: "website",
      locale: locale === "en" ? "en_US" : "ko_KR",
    },
  };
}

export default async function ProductPage({ params }: { params: Params }) {
  const { locale, slug } = await params;
  const product = products.find((p) => p.slug === slug);
  if (!product) notFound();

  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const url = `${base}${locale === "en" ? "/en" : ""}/product/${slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: loc(product.name, locale),
    description: loc(product.summary, locale),
    sku: product.slug,
    brand: { "@type": "Brand", name: siteConfig.logoText },
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "KRW",
      price: product.price,
      availability: "https://schema.org/InStock",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <ProductDetailView product={product} />
    </>
  );
}