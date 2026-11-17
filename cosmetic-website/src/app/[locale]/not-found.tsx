import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function LocaleNotFound() {
  const t = useTranslations("NotFound");
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="text-6xl font-bold text-brand">404</p>
      <h1 className="mt-4 text-2xl font-bold">{t("title")}</h1>
      <p className="mt-2 max-w-md text-sm text-muted">{t("text")}</p>
      <Link
        href="/"
        className="mt-8 rounded-full bg-brand px-8 py-3 text-sm font-semibold text-white hover:bg-brand-dark"
      >
        {t("home")}
      </Link>
    </div>
  );
}