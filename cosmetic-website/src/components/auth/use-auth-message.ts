"use client";

import { useTranslations } from "next-intl";
import type { ActionResult } from "@/lib/actions/auth";

export function useAuthMessage(state: ActionResult | null) {
  const t = useTranslations("Auth");
  if (!state) return { error: null, info: null };

  if (!state.ok) {
    const key = `errors.${state.error}`;
    return { error: t.has(key) ? t(key) : t("errors.generic"), info: null };
  }

  const key = `messages.${state.message ?? ""}`;
  return { error: null, info: state.message && t.has(key) ? t(key) : null };
}