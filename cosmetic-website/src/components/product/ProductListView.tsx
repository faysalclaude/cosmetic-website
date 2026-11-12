"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { SlidersHorizontal, X } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import { products } from "@/lib/products";
import type { Category, Product } from "@/types";
import ProductCard from "./ProductCard";

type Sort = "featured" | "priceAsc" | "priceDesc" | "discount";

const categories: Category[] = ["skinCare", "hairCare", "makeup"];

const discountOf = (p: Product) => (p.compareAt ? 1 - p.price / p.compareAt : 0);

export default function ProductListView() {
  const t = useTranslations("ProductList");
  const router = useRouter();
  useLocale();
  const q = (useSearchParams().get("q") ?? "").trim();

  const [category, setCategory] = useState<Category | "all">("all");
  const [sort, setSort] = useState<Sort>("featured");
  const [minInput, setMinInput] = useState("");
  const [maxInput, setMaxInput] = useState("");
  const [range, setRange] = useState({ min: 0, max: Infinity });
  const [showFilters, setShowFilters] = useState(false);

  const counts = useMemo(() => {
    const result: Record<string, number> = { all: products.length };
    for (const c of categories) {
      result[c] = products.filter((p) => p.category === c).length;
    }
    return result;
  }, []);

  const visible = useMemo(() => {
    const needle = q.toLowerCase();
    const list = products.filter((p) => {
      if (category !== "all" && p.category !== category) return false;
      if (p.price < range.min || p.price > range.max) return false;
      if (needle) {
        const haystack = [
          p.name.ko,
          p.name.en,
          p.summary.ko,
          p.summary.en,
          p.area.ko,
          p.area.en,
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(needle)) return false;
      }
      return true;
    });

    const sorted = [...list];
    if (sort === "priceAsc") sorted.sort((a, b) => a.price - b.price);
    if (sort === "priceDesc") sorted.sort((a, b) => b.price - a.price);
    if (sort === "discount") sorted.sort((a, b) => discountOf(b) - discountOf(a));
    return sorted;
  }, [q, category, range, sort]);

  function applyPrice() {
    setRange({
      min: Number(minInput) || 0,
      max: Number(maxInput) || Infinity,
    });
  }

  function resetAll() {
    setCategory("all");
    setSort("featured");
    setMinInput("");
    setMaxInput("");
    setRange({ min: 0, max: Infinity });
    if (q) router.replace("/product-list");
  }

  const filterPanel = (
    <div className="space-y-8">
      <div>
        <h2 className="mb-4 font-semibold">{t("category")}</h2>
        <ul className="space-y-1">
          {(["all", ...categories] as const).map((c) => (
            <li key={c}>
              <button
                onClick={() => setCategory(c)}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm transition-colors ${
                  category === c
                    ? "bg-brand-soft font-semibold text-brand"
                    : "hover:bg-cream"
                }`}
              >
                <span>{t(c)}</span>
                <span className="text-xs text-muted">{counts[c]}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2 className="mb-4 font-semibold">{t("priceRange")}</h2>
        <div className="flex gap-2">
          <input
            inputMode="numeric"
            value={minInput}
            onChange={(e) => setMinInput(e.target.value.replace(/\D/g, ""))}
            placeholder={t("min")}
            className="w-full rounded-xl border border-line px-3 py-2 text-sm outline-none focus:border-brand"
          />
          <input
            inputMode="numeric"
            value={maxInput}
            onChange={(e) => setMaxInput(e.target.value.replace(/\D/g, ""))}
            placeholder={t("max")}
            className="w-full rounded-xl border border-line px-3 py-2 text-sm outline-none focus:border-brand"
          />
        </div>
        <button
          onClick={applyPrice}
          className="mt-3 w-full rounded-full border border-ink py-2.5 text-sm font-semibold transition-colors hover:bg-ink hover:text-white"
        >
          {t("apply")}
        </button>
      </div>

      <button onClick={resetAll} className="text-sm text-muted underline">
        {t("reset")}
      </button>
    </div>
  );

  return (
    <div className="container-page py-8">
      <nav className="mb-6 flex items-center gap-2 text-sm text-muted">
        <Link href="/" className="hover:text-brand">
          {t("home")}
        </Link>
        <span>/</span>
        <span className="text-ink">{t("title")}</span>
      </nav>

      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="mt-1 text-sm text-muted">
            {t("results", { count: visible.length })}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters((v) => !v)}
            className="flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm font-medium lg:hidden"
          >
            <SlidersHorizontal size={16} />
            {t("filters")}
          </button>
          <label className="flex items-center gap-2 text-sm">
            <span className="text-muted">{t("sortBy")}</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className="rounded-full border border-line bg-white px-4 py-2 outline-none focus:border-brand"
            >
              <option value="featured">{t("featured")}</option>
              <option value="priceAsc">{t("priceAsc")}</option>
              <option value="priceDesc">{t("priceDesc")}</option>
              <option value="discount">{t("discount")}</option>
            </select>
          </label>
        </div>
      </div>

      {q && (
        <div className="mt-4">
          <button
            onClick={() => router.replace("/product-list")}
            className="inline-flex items-center gap-2 rounded-full bg-brand-soft px-4 py-1.5 text-sm font-medium text-brand"
          >
            {t("searchFor", { q })}
            <X size={14} />
          </button>
        </div>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className={`${showFilters ? "block" : "hidden"} lg:block`}>
          <div className="rounded-3xl border border-line bg-white p-6 lg:sticky lg:top-24">
            {filterPanel}
          </div>
        </aside>

        <div>
          {visible.length === 0 ? (
            <div className="rounded-3xl bg-cream py-20 text-center">
              <p className="text-muted">{t("noResults")}</p>
              <button
                onClick={resetAll}
                className="mt-4 rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white"
              >
                {t("reset")}
              </button>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {visible.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}