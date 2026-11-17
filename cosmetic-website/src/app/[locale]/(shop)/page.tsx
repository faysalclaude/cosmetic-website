import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import HeroSlider from "@/components/home/HeroSlider";
import CategoryStrip from "@/components/home/CategoryStrip";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import HomeShowcase from "@/components/showcase/HomeShowcase";
import WhereToBuy from "@/components/home/WhereToBuy";
import BlogPreview from "@/components/home/BlogPreview";
import { getCategories } from "@/lib/data/categories";
import { getProducts } from "@/lib/data/products";
import { getPublishedPosts } from "@/lib/data/blog";

export const revalidate = 60;

type Params = Promise<{ locale: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Home" });
  return {
    title: { absolute: t("metaTitle") },
    description: t("metaDescription"),
    alternates: {
      canonical: locale === "en" ? "/en" : "/",
      languages: { ko: "/", en: "/en" },
    },
    openGraph: {
      title: t("metaTitle"),
      description: t("metaDescription"),
      type: "website",
      locale: locale === "en" ? "en_US" : "ko_KR",
    },
  };
}

export default async function HomePage() {
  const [products, categories, posts] = await Promise.all([
    getProducts(),
    getCategories(),
    getPublishedPosts(3),
  ]);
  const withShowcase = products.find((p) => p.showcase);

  const counts: Record<string, number> = {};
  for (const p of products) counts[p.category] = (counts[p.category] ?? 0) + 1;

  return (
    <>
      <HeroSlider products={products} />
      <CategoryStrip categories={categories} counts={counts} />
      <FeaturedProducts products={products} />
      <HomeShowcase
        showcase={
          withShowcase?.showcase
            ? {
                name: withShowcase.name,
                imageUrl: withShowcase.showcase.imageUrl,
                palette: {
                  accent: withShowcase.showcase.accent,
                  soft: withShowcase.showcase.soft,
                  deep: withShowcase.showcase.deep,
                },
              }
            : undefined
        }
      />
      <WhereToBuy />
      <BlogPreview posts={posts} />
    </>
  );
}