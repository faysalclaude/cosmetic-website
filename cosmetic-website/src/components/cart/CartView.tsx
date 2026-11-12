"use client";

import { useLocale, useTranslations } from "next-intl";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { selectSubtotal, useCartStore } from "@/store/cart";
import { useMounted } from "@/lib/use-mounted";
import { siteConfig } from "@/lib/site";
import { formatKRW, loc, shippingFor } from "@/lib/utils";
import ProductVisual from "@/components/product/ProductVisual";

export default function CartView() {
  const t = useTranslations("CartPage");
  const locale = useLocale();
  const mounted = useMounted();
  const { items, setQty, remove } = useCartStore();
  const storedSubtotal = useCartStore(selectSubtotal);

  const list = mounted ? items : [];
  const subtotal = mounted ? storedSubtotal : 0;
  const shipping = shippingFor(subtotal);
  const total = subtotal + shipping;
  const left = Math.max(0, siteConfig.shipping.freeOver - subtotal);
  const progress = Math.min(100, (subtotal / siteConfig.shipping.freeOver) * 100);

  if (list.length === 0) {
    return (
      <div className="container-page flex flex-col items-center py-28 text-center">
        <ShoppingBag size={64} className="text-line" />
        <h1 className="mt-6 text-2xl font-bold">{t("empty")}</h1>
        <Link
          href="/product-list"
          className="mt-6 rounded-full bg-brand px-8 py-3 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          {t("continue")}
        </Link>
      </div>
    );
  }

  return (
    <div className="container-page py-10">
      <h1 className="mb-8 text-3xl font-bold tracking-tight">{t("title")}</h1>

      <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
        <ul className="divide-y divide-line rounded-3xl border border-line bg-white">
          {list.map(({ product, qty }) => {
            const name = loc(product.name, locale);
            return (
              <li key={product.id} className="flex gap-4 p-5">
                <Link href={`/product/${product.slug}`} className="shrink-0">
                  <ProductVisual
                    tint={product.tint}
                    accent={product.accent}
                    label={name}
                    className="h-24 w-24 rounded-2xl sm:h-28 sm:w-28"
                  />
                </Link>
                <div className="flex min-w-0 flex-1 flex-col">
                  <Link
                    href={`/product/${product.slug}`}
                    className="line-clamp-2 font-medium hover:text-brand"
                  >
                    {name}
                  </Link>
                  <p className="mt-1 text-sm font-semibold text-brand">
                    {formatKRW(product.price, locale)}
                  </p>

                  <div className="mt-auto flex items-center justify-between pt-3">
                    <div className="flex items-center rounded-full border border-line">
                      <button
                        className="p-2"
                        onClick={() => setQty(product.id, qty - 1)}
                        aria-label="-"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-7 text-center text-sm">{qty}</span>
                      <button
                        className="p-2"
                        onClick={() => setQty(product.id, qty + 1)}
                        aria-label="+"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-semibold">
                        {formatKRW(product.price * qty, locale)}
                      </span>
                      <button
                        onClick={() => remove(product.id)}
                        aria-label={t("remove")}
                        className="text-muted hover:text-brand"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        <aside className="h-fit rounded-3xl border border-line bg-white p-6 lg:sticky lg:top-24">
          <h2 className="mb-5 text-lg font-semibold">{t("summary")}</h2>

          <div className="mb-5 rounded-2xl bg-brand-soft p-4 text-sm">
            <p className="font-medium text-brand">
              {left > 0
                ? t("freeLeft", { amount: formatKRW(left, locale) })
                : t("freeReached")}
            </p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white">
              <div
                className="h-full rounded-full bg-brand transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">{t("subtotal")}</dt>
              <dd>{formatKRW(subtotal, locale)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">{t("shipping")}</dt>
              <dd>{shipping === 0 ? t("free") : formatKRW(shipping, locale)}</dd>
            </div>
            <div className="flex justify-between border-t border-line pt-4 text-base font-bold">
              <dt>{t("total")}</dt>
              <dd className="text-brand">{formatKRW(total, locale)}</dd>
            </div>
          </dl>

          <Link
            href="/checkout"
            className="mt-6 block rounded-full bg-brand py-3.5 text-center font-semibold text-white hover:bg-brand-dark"
          >
            {t("checkout")}
          </Link>
          <Link
            href="/product-list"
            className="mt-3 block text-center text-sm text-muted underline"
          >
            {t("continue")}
          </Link>
        </aside>
      </div>
    </div>
  );
}