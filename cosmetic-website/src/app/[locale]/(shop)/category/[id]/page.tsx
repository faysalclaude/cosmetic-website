import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { routing } from "@/i18n/routing";
import { getCategories } from "@/lib/data/categories";
import { getProducts } from "@/lib/data/products";
import { loc } from "@/lib/utils";
import ProductListView from "@/components/product/ProductListView";

export const revalidate = 60;

type Params = Promise<{ locale: string; id: string }>;

export async function generateStaticParams() {
  const categories = await getCategories();
  return routing.locales.flatMap((locale) =>
    categories.map((c) => ({ locale, id: c.id })),
  );
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, id } = await params;
  const category = (await getCategories()).find((c) => c.id === id);
  if (!category) return {};

  const name = loc(category.name, locale);
  const description =
    loc(category.description, locale) ||
    (locale === "en" ? `Shop our ${name} products.` : `${name} 제품을 만나보세요.`);
  const path = `/category/${id}`;

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

export default async function CategoryPage({ params }: { params: Params }) {
  const { id } = await params;
  const [categories, products] = await Promise.all([getCategories(), getProducts()]);
  if (!categories.some((c) => c.id === id)) notFound();

  return (
    <Suspense fallback={null}>
      <ProductListView products={products} categories={categories} activeCategory={id} />
    </Suspense>
  );
}