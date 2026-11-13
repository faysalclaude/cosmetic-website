"use client";

import { useLocale, useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/browser";

export default function LogoutButton({ className = "" }: { className?: string }) {
  const t = useTranslations("Auth");
  const locale = useLocale();

  async function onClick() {
    await createClient().auth.signOut();
    window.location.assign(locale === "en" ? "/en" : "/");
  }

  return (
    <button onClick={onClick} className={className}>
      {t("logout")}
    </button>
  );
}