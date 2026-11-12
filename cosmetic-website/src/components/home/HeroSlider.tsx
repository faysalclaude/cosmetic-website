"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { products } from "@/lib/products";
import { loc } from "@/lib/utils";
import ProductVisual from "@/components/product/ProductVisual";

export default function HeroSlider() {
  const t = useTranslations("Common");
  const locale = useLocale();
  const [index, setIndex] = useState(0);
  const total = products.length;

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % total), 6000);
    return () => clearInterval(id);
  }, [total]);

  const slide = products[index];
  const name = loc(slide.name, locale);

  return (
    <section
      className="relative transition-colors duration-700"
      style={{ backgroundColor: slide.tint }}
    >
      <div
        key={slide.id}
        className="container-page animate-fade grid items-center gap-8 py-12 md:grid-cols-2 md:py-20"
      >
        <div className="order-2 md:order-1">
          <p className="mb-3 text-sm font-medium text-brand">{name}</p>
          <h1 className="mb-4 text-4xl font-bold md:text-5xl">
            {loc(slide.heroTag, locale)}
          </h1>
          <p className="mb-8 max-w-lg leading-relaxed text-muted">
            {loc(slide.summary, locale)}
          </p>
          <Link
            href={`/product/${slide.slug}`}
            className="inline-block rounded-full bg-ink px-8 py-3 text-sm font-medium text-white hover:bg-brand"
          >
            {t("learnMore")}
          </Link>
        </div>

        <div className="order-1 md:order-2">
          <ProductVisual
            tint="#ffffff00"
            accent={slide.accent}
            label={name}
            className="mx-auto aspect-square w-full max-w-md rounded-3xl"
          />
        </div>
      </div>

      <button
        onClick={() => setIndex((i) => (i - 1 + total) % total)}
        className="absolute top-1/2 left-3 hidden -translate-y-1/2 rounded-full bg-white/80 p-2 shadow hover:bg-white md:block"
        aria-label="previous"
      >
        <ChevronLeft />
      </button>
      <button
        onClick={() => setIndex((i) => (i + 1) % total)}
        className="absolute top-1/2 right-3 hidden -translate-y-1/2 rounded-full bg-white/80 p-2 shadow hover:bg-white md:block"
        aria-label="next"
      >
        <ChevronRight />
      </button>

      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
        {products.map((p, i) => (
          <button
            key={p.id}
            onClick={() => setIndex(i)}
            aria-label={`slide ${i + 1}`}
            className={`h-2 rounded-full transition-all ${
              i === index ? "w-6 bg-brand" : "w-2 bg-ink/20"
            }`}
          />
        ))}
      </div>
    </section>
  );
}