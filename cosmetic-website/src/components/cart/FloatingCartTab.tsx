"use client";

import { useTranslations } from "next-intl";
import { ShoppingBag } from "lucide-react";
import { selectCount, useCartStore } from "@/store/cart";
import { useMounted } from "@/lib/use-mounted";

export default function FloatingCartTab() {
  const t = useTranslations("Common");
  const mounted = useMounted();
  const count = useCartStore(selectCount);
  const isOpen = useCartStore((s) => s.isOpen);
  const open = useCartStore((s) => s.open);

  if (isOpen) return null;

  return (
    <button
      onClick={open}
      aria-label={t("cart")}
      className="fixed top-1/2 right-0 z-30 hidden -translate-y-1/2 flex-col items-center gap-3 rounded-l-2xl bg-brand px-3 py-5 text-white shadow-xl transition-all hover:pr-5 hover:bg-brand-dark sm:flex"
    >
      <ShoppingBag size={22} />
      <span
        className="text-sm font-bold tracking-widest"
        style={{ writingMode: "vertical-rl" }}
      >
        {t("cart").toUpperCase()} ({mounted ? count : 0})
      </span>
    </button>
  );
}