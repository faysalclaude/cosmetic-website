"use client";

import { useLocale, useTranslations } from "next-intl";
import { Minus, Plus, ShoppingBag, X } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { selectSubtotal, useCartStore } from "@/store/cart";
import { useMounted } from "@/lib/use-mounted";
import { formatKRW, loc } from "@/lib/utils";
import ProductVisual from "@/components/product/ProductVisual";

export default function CartDrawer() {
  const t = useTranslations("Cart");
  const locale = useLocale();
  const mounted = useMounted();
  const { items, isOpen, close, setQty, remove } = useCartStore();
  const subtotal = useCartStore(selectSubtotal);

  const list = mounted ? items : [];

  return (
    <>
      <div
        onClick={close}
        className={`fixed inset-0 z-50 bg-black/40 transition-opacity ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <aside
        className={`fixed top-0 right-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-hidden={!isOpen}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="font-semibold">
            {t("title")} ({list.reduce((n, i) => n + i.qty, 0)})
          </h2>
          <button onClick={close} aria-label="close">
            <X size={22} />
          </button>
        </div>

        {list.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
            <ShoppingBag size={56} className="text-line" />
            <p className="font-medium">{t("empty")}</p>
            <Link
              href="/product-list"
              onClick={close}
              className="text-sm text-brand underline"
            >
              {t("continue")}
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-line overflow-y-auto px-5">
              {list.map(({ product, qty }) => (
                <li key={product.id} className="flex gap-3 py-4">
                  <ProductVisual
                    tint={product.tint}
                    accent={product.accent}
                    label={loc(product.name, locale)}
                    className="h-20 w-20 shrink-0 rounded-lg"
                    src={product.images[0]}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-medium">
                      {loc(product.name, locale)}
                    </p>
                    <p className="mt-1 text-sm text-brand">
                      {formatKRW(product.price, locale)}
                    </p>
                    <div className="mt-2 flex items-center gap-3">
                      <div className="flex items-center rounded-full border border-line">
                        <button
                          className="p-1.5"
                          onClick={() => setQty(product.id, qty - 1)}
                          aria-label="-"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-6 text-center text-sm">{qty}</span>
                        <button
                          className="p-1.5"
                          onClick={() => setQty(product.id, qty + 1)}
                          aria-label="+"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <button
                        className="text-xs text-muted underline"
                        onClick={() => remove(product.id)}
                      >
                        {t("remove")}
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="space-y-3 border-t border-line p-5">
              <div className="flex justify-between font-semibold">
                <span>{t("subtotal")}</span>
                <span>{formatKRW(mounted ? subtotal : 0, locale)}</span>
              </div>
              <Link
                href="/cart-list"
                onClick={close}
                className="block rounded-full border border-ink py-3 text-center text-sm font-medium"
              >
                {t("viewCart")}
              </Link>
              <Link
                href="/checkout"
                onClick={close}
                className="block rounded-full bg-brand py-3 text-center text-sm font-medium text-white hover:bg-brand-dark"
              >
                {t("checkout")}
              </Link>
            </div>
          </>
        )}
      </aside>
    </>
  );
}