import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { getProductBySlug, getProducts } from "@/lib/data/products";
import { siteConfig } from "@/lib/site";
import { loc } from "@/lib/utils";
import ProductDetailView from "@/components/product/ProductDetailView";

export const revalidate = 60;

type Params = Promise<{ locale: string; slug: string }>;

export async function generateStaticParams() {
  const products = await getProducts();
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
  const product = await getProductBySlug(slug);
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
      images: product.images[0] ? [product.images[0]] : undefined,
    },
  };
}

export default async function ProductPage({ params }: { params: Params }) {
  const { locale, slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const all = await getProducts();
  const related = all.filter((p) => p.id !== product.id).slice(0, 3);

  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const url = `${base}${locale === "en" ? "/en" : ""}/product/${slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: loc(product.name, locale),
    description: loc(product.summary, locale),
    sku: product.slug,
    image: product.images.length ? product.images : undefined,
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
      <ProductDetailView product={product} related={related} />
    </>
  );
}