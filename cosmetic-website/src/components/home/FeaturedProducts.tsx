import { useTranslations } from "next-intl";
import { products } from "@/lib/products";
import ProductCard from "@/components/product/ProductCard";

export default function FeaturedProducts() {
  const t = useTranslations("Home");
  return (
    <section className="container-page py-16">
      <div className="mb-10 text-center">
        <h2 className="text-2xl font-bold md:text-3xl">{t("featuredTitle")}</h2>
        <p className="mt-2 text-muted">{t("featuredSubtitle")}</p>
      </div>
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}