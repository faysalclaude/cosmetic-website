"use client";

import { Heart, ShoppingBag } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useCartStore } from "@/store/cart";
import { useWishlistStore } from "@/store/wishlist";
import { useMounted } from "@/lib/use-mounted";
import { formatKRW, loc } from "@/lib/utils";
import type { Product } from "@/types";
import ProductVisual from "./ProductVisual";

export default function ProductCard({ product }: { product: Product }) {
  const t = useTranslations("Common");
  const tp = useTranslations("ProductList");
  const locale = useLocale();
  const mounted = useMounted();
  const add = useCartStore((s) => s.add);
  const wished = useWishlistStore((s) => s.ids.includes(product.id));
  const toggleWish = useWishlistStore((s) => s.toggle);

  const name = loc(product.name, locale);
  const discount = product.compareAt
    ? Math.round((1 - product.price / product.compareAt) * 100)
    : 0;
  const isWished = mounted && wished;

  return (
    <article className="group flex flex-col overflow-hidden rounded-3xl border border-line bg-white transition-shadow duration-300 hover:shadow-xl">
      <div className="relative overflow-hidden">
        <Link href={`/product/${product.slug}`} className="block">
          <ProductVisual
            tint={product.tint}
            accent={product.accent}
            label={name}
            className="aspect-square w-full transition-transform duration-500 group-hover:scale-105"
            src={product.images[0]}
          />
        </Link>

        <div className="absolute top-3 left-3 flex flex-col items-start gap-1">
          {discount > 0 && (
            <span className="rounded-full bg-brand px-3 py-1 text-xs font-bold text-white">
              -{discount}%
            </span>
          )}
          {product.isNew && (
            <span className="rounded-full bg-ink px-3 py-1 text-xs font-semibold text-white">
              {t("new")}
            </span>
          )}
        </div>

        <button
          onClick={() => toggleWish(product.id)}
          aria-label={tp("wishlist")}
          aria-pressed={isWished}
          className="absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow transition-transform hover:scale-110"
        >
          <Heart
            size={18}
            className={isWished ? "text-brand" : "text-ink"}
            fill={isWished ? "currentColor" : "none"}
          />
        </button>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <Link
          href={`/category/${product.category}`}
          className="mb-2 w-fit rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold text-brand hover:bg-brand hover:text-white"
        >
          {loc(product.area, locale)}
        </Link>
        <Link href={`/product/${product.slug}`}>
          <h3 className="line-clamp-2 min-h-[3rem] font-semibold group-hover:text-brand">
            {name}
          </h3>
        </Link>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-lg font-bold text-brand">
            {formatKRW(product.price, locale)}
          </span>
          {product.compareAt && (
            <span className="text-sm text-muted line-through">
              {formatKRW(product.compareAt, locale)}
            </span>
          )}
        </div>
        <button
          onClick={() => add(product)}
          className="mt-4 flex items-center justify-center gap-2 rounded-full bg-brand py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
        >
          <ShoppingBag size={16} />
          {t("addToCart")}
        </button>
      </div>
    </article>
  );
}