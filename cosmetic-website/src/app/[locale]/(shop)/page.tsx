import HeroSlider from "@/components/home/HeroSlider";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import HomeShowcase from "@/components/showcase/HomeShowcase";
import WhereToBuy from "@/components/home/WhereToBuy";
import BlogPreview from "@/components/home/BlogPreview";

export default function HomePage() {
  return (
    <>
      <HeroSlider />
      <FeaturedProducts />
      <HomeShowcase />
      <WhereToBuy />
      <BlogPreview />
    </>
  );
}