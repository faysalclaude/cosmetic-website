import HeroSlider from "@/components/home/HeroSlider";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import HomeShowcase from "@/components/showcase/HomeShowcase";
import WhereToBuy from "@/components/home/WhereToBuy";
import BlogPreview from "@/components/home/BlogPreview";
import { getProducts } from "@/lib/data/products";

export const revalidate = 60;

export default async function HomePage() {
  const products = await getProducts();
  const withShowcase = products.find((p) => p.showcase);

  return (
    <>
      <HeroSlider products={products} />
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