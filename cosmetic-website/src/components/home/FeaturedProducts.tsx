import { useTranslations } from "next-intl";
import ProductCard from "@/components/product/ProductCard";
import Reveal from "@/components/ui/Reveal";
import type { Product } from "@/types";

export default function FeaturedProducts({ products }: { products: Product[] }) {
  const t = useTranslations("Home");
  return (
    <section className="container-page py-20">
      <Reveal className="mb-12 text-center">
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
          {t("featuredTitle")}
        </h2>
        <p className="mt-3 text-muted">{t("featuredSubtitle")}</p>
      </Reveal>
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {products.slice(0, 6).map((p, i) => (
          <Reveal key={p.id} delay={i * 0.12}>
            <ProductCard product={p} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}