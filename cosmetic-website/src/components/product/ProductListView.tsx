"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { SlidersHorizontal, X } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import { loc } from "@/lib/utils";
import type { CategoryInfo, Product } from "@/types";
import ProductCard from "./ProductCard";

type Sort = "featured" | "priceAsc" | "priceDesc" | "discount";

type Props = {
  products: Product[];
  categories: CategoryInfo[];
  activeCategory?: string;
};

const discountOf = (p: Product) => (p.compareAt ? 1 - p.price / p.compareAt : 0);

export default function ProductListView({ products, categories, activeCategory }: Props) {
  const t = useTranslations("ProductList");
  const locale = useLocale();
  const router = useRouter();
  const q = (useSearchParams().get("q") ?? "").trim();

  const [sort, setSort] = useState<Sort>("featured");
  const [minInput, setMinInput] = useState("");
  const [maxInput, setMaxInput] = useState("");
  const [range, setRange] = useState({ min: 0, max: Infinity });
  const [showFilters, setShowFilters] = useState(false);

  const basePath = activeCategory ? `/category/${activeCategory}` : "/product-list";
  const active = categories.find((c) => c.id === activeCategory);
  const heading = active ? loc(active.name, locale) : t("title");
  const intro = active ? loc(active.description, locale) : "";

  const counts = useMemo(() => {
    const result: Record<string, number> = {};
    for (const p of products) result[p.category] = (result[p.category] ?? 0) + 1;
    return result;
  }, [products]);

  const listed = categories.filter((c) => (counts[c.id] ?? 0) > 0 || c.id === activeCategory);

  const visible = useMemo(() => {
    const needle = q.toLowerCase();
    const list = products.filter((p) => {
      if (activeCategory && p.category !== activeCategory) return false;
      if (p.price < range.min || p.price > range.max) return false;
      if (needle) {
        const haystack = [p.name.ko, p.name.en, p.summary.ko, p.summary.en, p.area.ko, p.area.en]
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
  }, [products, q, activeCategory, range, sort]);

  function applyPrice() {
    setRange({ min: Number(minInput) || 0, max: Number(maxInput) || Infinity });
  }

  function resetFilters() {
    setSort("featured");
    setMinInput("");
    setMaxInput("");
    setRange({ min: 0, max: Infinity });
    if (q) router.replace(basePath);
  }

  const itemClass = (isActive: boolean) =>
    `flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm transition-colors ${
      isActive ? "bg-brand-soft font-semibold text-brand" : "hover:bg-cream"
    }`;

  const filterPanel = (
    <div className="space-y-8">
      <div>
        <h2 className="mb-4 font-semibold">{t("category")}</h2>
        <ul className="space-y-1">
          <li>
            <Link href="/product-list" className={itemClass(!activeCategory)}>
              <span>{t("all")}</span>
              <span className="text-xs text-muted">{products.length}</span>
            </Link>
          </li>
          {listed.map((c) => (
            <li key={c.id}>
              <Link href={`/category/${c.id}`} className={itemClass(c.id === activeCategory)}>
                <span>{loc(c.name, locale)}</span>
                <span className="text-xs text-muted">{counts[c.id] ?? 0}</span>
              </Link>
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

      <button onClick={resetFilters} className="text-sm text-muted underline">
        {t("reset")}
      </button>
    </div>
  );

  return (
    <div className="container-page py-8">
      <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-muted">
        <Link href="/" className="hover:text-brand">
          {t("home")}
        </Link>
        <span>/</span>
        {active ? (
          <>
            <Link href="/product-list" className="hover:text-brand">
              {t("title")}
            </Link>
            <span>/</span>
            <span className="text-ink">{heading}</span>
          </>
        ) : (
          <span className="text-ink">{t("title")}</span>
        )}
      </nav>

      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{heading}</h1>
          {intro && <p className="mt-2 max-w-2xl text-sm text-muted">{intro}</p>}
          <p className="mt-1 text-sm text-muted">{t("results", { count: visible.length })}</p>
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
            onClick={() => router.replace(basePath)}
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
                onClick={resetFilters}
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