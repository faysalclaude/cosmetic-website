import HeroSlider from "@/components/home/HeroSlider";
import CategoryStrip from "@/components/home/CategoryStrip";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import HomeShowcase from "@/components/showcase/HomeShowcase";
import WhereToBuy from "@/components/home/WhereToBuy";
import BlogPreview from "@/components/home/BlogPreview";
import { getCategories } from "@/lib/data/categories";
import { getProducts } from "@/lib/data/products";

export const revalidate = 60;

export default async function HomePage() {
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);
  const withShowcase = products.find((p) => p.showcase);

  const counts: Record<string, number> = {};
  for (const p of products) counts[p.category] = (counts[p.category] ?? 0) + 1;

  return (
    <>
      <HeroSlider products={products} />
      <CategoryStrip categories={categories} counts={counts} />
      <FeaturedProducts products={products} />
      <HomeShowcase
        fallback={
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
      <BlogPreview />
    </>
  );
}