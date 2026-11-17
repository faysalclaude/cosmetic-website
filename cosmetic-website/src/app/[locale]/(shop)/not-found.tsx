import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function ShopNotFound() {
  const t = useTranslations("NotFound");
  return (
    <div className="container-page flex flex-col items-center py-28 text-center">
      <p className="text-6xl font-bold text-brand">404</p>
      <h1 className="mt-4 text-2xl font-bold">{t("title")}</h1>
      <p className="mt-2 max-w-md text-sm text-muted">{t("text")}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="rounded-full bg-brand px-8 py-3 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          {t("home")}
        </Link>
        <Link
          href="/product-list"
          className="rounded-full border border-ink px-8 py-3 text-sm font-semibold hover:bg-ink hover:text-white"
        >
          {t("products")}
        </Link>
      </div>
    </div>
  );
}