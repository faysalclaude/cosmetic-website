import { useTranslations } from "next-intl";
import LanguageSwitcher from "@/components/layout/LanguageSwitcher";

export default function HomePage() {
  const t = useTranslations("Home");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <LanguageSwitcher />
      <h1 className="text-4xl font-bold">{t("title")}</h1>
      <p className="text-gray-600">{t("subtitle")}</p>
    </main>
  );
}