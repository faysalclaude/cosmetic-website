"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Menu, Search, ShoppingBag, X } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import LanguageSwitcher from "./LanguageSwitcher";
import { selectCount, useCartStore } from "@/store/cart";
import { useMounted } from "@/lib/use-mounted";
import { siteConfig } from "@/lib/site";
import UserMenu from "@/components/auth/UserMenu";

const logoClass = "font-serif font-semibold text-brand-dark";

export default function Header() {
  const t = useTranslations();
  const router = useRouter();
  const mounted = useMounted();
  const count = useCartStore(selectCount);
  const openCart = useCartStore((s) => s.open);
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");

  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setMenuOpen(false);
    router.push(`/product-list?q=${encodeURIComponent(q)}`);
  }

  const searchForm = (
    <form onSubmit={onSearch} className="relative w-full">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t("Header.searchPlaceholder")}
        aria-label={t("Header.search")}
        className="w-full rounded-full border border-transparent bg-cream py-2.5 pr-11 pl-5 text-sm outline-none transition-colors focus:border-brand focus:bg-white"
      />
      <button
        type="submit"
        aria-label={t("Header.search")}
        className="absolute top-1/2 right-4 -translate-y-1/2 text-muted hover:text-brand"
      >
        <Search size={18} />
      </button>
    </form>
  );

  return (
    <>
      {/* desktop: large centred logo row */}
      <div className="hidden border-b border-line bg-white md:block">
        <div className="container-page flex h-24 items-center justify-between">
          <div className="flex w-40 gap-2">
            {["IG", "FB", "YT"].map((s) => (
              <a
                key={s}
                href="#"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-line text-[11px] text-muted hover:border-brand hover:text-brand"
              >
                {s}
              </a>
            ))}
          </div>
          <Link
            href="/"
            className={`${logoClass} text-4xl tracking-[0.4em] lg:text-5xl`}
          >
            {siteConfig.logoText}
          </Link>
          <div className="flex w-40 justify-end">
            <LanguageSwitcher />
          </div>
        </div>
      </div>

      {/* sticky navigation row */}
      <div className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur">
        <div className="container-page flex h-16 items-center gap-4">
          <div className="flex flex-1 items-center gap-8">
            <button
              className="md:hidden"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={t("Common.menu")}
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <Link href="/blog" className="hidden text-sm font-medium hover:text-brand md:block">
              {t("Common.blog")}
            </Link>
            <Link href="/product-list" className="hidden text-sm font-medium hover:text-brand md:block">
              {t("Common.products")}
            </Link>
          </div>

          <Link href="/" className={`${logoClass} text-xl tracking-[0.3em] md:hidden`}>
            {siteConfig.logoText}
          </Link>

          <div className="hidden w-full max-w-md md:block">{searchForm}</div>

          <div className="flex flex-1 items-center justify-end gap-4 sm:gap-5">
            <button onClick={openCart} className="relative" aria-label={t("Common.cart")}>
              <ShoppingBag size={22} />
              <span className="absolute -top-2 -right-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1 text-[11px] font-semibold text-white">
                {mounted ? count : 0}
              </span>
            </button>
            <UserMenu />
            <div className="md:hidden">
              <LanguageSwitcher />
            </div>
          </div>
        </div>

        {menuOpen && (
          <div className="border-t border-line bg-white px-4 py-4 md:hidden">
            <div className="mb-4">{searchForm}</div>
            <div className="flex flex-col gap-3 text-sm font-medium">
              <Link href="/product-list" onClick={() => setMenuOpen(false)}>
                {t("Common.products")}
              </Link>
              <Link href="/blog" onClick={() => setMenuOpen(false)}>
                {t("Common.blog")}
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}