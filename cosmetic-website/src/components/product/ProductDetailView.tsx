"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  Check,
  ChevronDown,
  Heart,
  Minus,
  Plus,
  RotateCcw,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useCartStore } from "@/store/cart";
import { useWishlistStore } from "@/store/wishlist";
import { useMounted } from "@/lib/use-mounted";
import { siteConfig } from "@/lib/site";
import { formatKRW, loc } from "@/lib/utils";
import { getDetails } from "@/lib/product-details";
import { products } from "@/lib/products";
import type { Product } from "@/types";
import ProductVisual from "./ProductVisual";
import ProductCard from "./ProductCard";
import ScrollShowcase from "@/components/showcase/ScrollShowcase";
import { defaultChapters } from "@/components/showcase/copy";

export default function ProductDetailView({ product }: { product: Product }) {
  const t = useTranslations("Product");
  const tc = useTranslations("Common");
  const locale = useLocale();
  const lang = locale === "en" ? "en" : "ko";
  const mounted = useMounted();

  const add = useCartStore((s) => s.add);
  const wished = useWishlistStore((s) => s.ids.includes(product.id));
  const toggleWish = useWishlistStore((s) => s.toggle);
  const [qty, setQty] = useState(1);

  const name = loc(product.name, locale);
  const details = getDetails(product.slug);
  const discount = product.compareAt
    ? Math.round((1 - product.price / product.compareAt) * 100)
    : 0;
  const related = products.filter((p) => p.id !== product.id).slice(0, 3);
  const isWished = mounted && wished;

  return (
    <>
      <div className="container-page py-8">
        <nav className="mb-8 flex flex-wrap items-center gap-2 text-sm text-muted">
          <Link href="/" className="hover:text-brand">{t("home")}</Link>
          <span>/</span>
          <Link href="/product-list" className="hover:text-brand">{t("products")}</Link>
          <span>/</span>
          <span className="line-clamp-1 text-ink">{name}</span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          {/* visual */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="relative overflow-hidden rounded-3xl border border-line">
              <ProductVisual
                tint={product.tint}
                accent={product.accent}
                label={name}
                className="aspect-square w-full"
              />
              {discount > 0 && (
                <span className="absolute top-4 left-4 rounded-full bg-brand px-4 py-1.5 text-sm font-bold text-white">
                  -{discount}%
                </span>
              )}
            </div>
          </div>

          {/* buy box */}
          <div>
            <span className="rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold text-brand">
              {loc(product.area, locale)}
            </span>
            <h1 className="mt-4 text-3xl leading-tight font-bold tracking-tight md:text-4xl">
              {name}
            </h1>

            <div className="mt-5 flex items-baseline gap-3">
              <span className="text-3xl font-bold text-brand">
                {formatKRW(product.price, locale)}
              </span>
              {product.compareAt && (
                <span className="text-lg text-muted line-through">
                  {formatKRW(product.compareAt, locale)}
                </span>
              )}
            </div>

            <p className="mt-6 leading-relaxed text-muted">
              {loc(product.summary, locale)}
            </p>

            {details && (
              <div className="mt-6">
                <h2 className="mb-3 text-sm font-semibold">{t("highlights")}</h2>
                <ul className="space-y-2">
                  {details.highlights[lang].map((h) => (
                    <li key={h} className="flex items-center gap-2 text-sm">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-soft text-brand">
                        <Check size={12} />
                      </span>
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <div className="flex items-center rounded-full border border-line">
                <button
                  className="p-3"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  aria-label="-"
                >
                  <Minus size={16} />
                </button>
                <span className="w-8 text-center font-medium">{qty}</span>
                <button
                  className="p-3"
                  onClick={() => setQty((q) => Math.min(99, q + 1))}
                  aria-label="+"
                >
                  <Plus size={16} />
                </button>
              </div>

              <button
                onClick={() => add(product, qty)}
                className="flex-1 rounded-full bg-brand px-8 py-3.5 font-semibold text-white transition-colors hover:bg-brand-dark"
              >
                {tc("addToCart")}
              </button>

              <button
                onClick={() => toggleWish(product.id)}
                aria-label={t("wishlist")}
                aria-pressed={isWished}
                className="flex h-12 w-12 items-center justify-center rounded-full border border-line hover:border-brand"
              >
                <Heart
                  size={20}
                  className={isWished ? "text-brand" : ""}
                  fill={isWished ? "currentColor" : "none"}
                />
              </button>
            </div>

            <div className="mt-8 grid gap-3 rounded-2xl bg-cream p-5 text-sm sm:grid-cols-3">
              <div className="flex items-center gap-2">
                <Truck size={18} className="shrink-0 text-brand" />
                {t("freeShipping", {
                  amount: formatKRW(siteConfig.shipping.freeOver, locale),
                })}
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="shrink-0 text-brand" />
                {t("securePayment")}
              </div>
              <div className="flex items-center gap-2">
                <RotateCcw size={18} className="shrink-0 text-brand" />
                {t("easyReturns")}
              </div>
            </div>

            <div className="mt-8 border-t border-line">
              {details && (
                <details open className="group border-b border-line py-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between font-semibold">
                    {t("howToUse")}
                    <ChevronDown size={18} className="transition-transform group-open:rotate-180" />
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-muted">
                    {loc(details.howToUse, locale)}
                  </p>
                </details>
              )}
              <details className="group border-b border-line py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between font-semibold">
                  {t("shippingReturns")}
                  <ChevronDown size={18} className="transition-transform group-open:rotate-180" />
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  {t("shippingText")}
                </p>
              </details>
            </div>
          </div>
        </div>
      </div>

      {/* animated brand story in the product's own colours */}
      <div className="mt-16">
        <ScrollShowcase
          palette={{ accent: product.accent, soft: product.tint, deep: "#4a0a25" }}
          name={name}
          chapters={defaultChapters(locale, name)}
          heightVh={300}
        />
      </div>

      <section className="container-page py-20">
        <h2 className="mb-10 text-center text-2xl font-bold md:text-3xl">
          {t("related")}
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {related.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </>
  );
}