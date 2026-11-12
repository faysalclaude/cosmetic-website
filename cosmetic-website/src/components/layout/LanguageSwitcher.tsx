"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";

export default function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const switchTo = locale === "ko" ? "en" : "ko";

  return (
    <button
      onClick={() => router.replace(pathname, { locale: switchTo })}
      className="rounded-full border px-4 py-1 text-sm font-medium hover:bg-black hover:text-white"
    >
      {switchTo === "en" ? "English" : "한국어"}
    </button>
  );
}