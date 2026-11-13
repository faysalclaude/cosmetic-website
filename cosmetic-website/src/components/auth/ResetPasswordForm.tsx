"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/browser";
import AuthCard, { Notice } from "./AuthCard";
import Field from "./Field";

export default function ResetPasswordForm() {
  const t = useTranslations("Auth");
  const locale = useLocale();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const password = String(form.get("password") ?? "");
    const confirm = String(form.get("confirmPassword") ?? "");

    if (password.length < 8) return setError(t("errors.passwordShort"));
    if (password !== confirm) return setError(t("errors.passwordMismatch"));

    setError(null);
    setPending(true);
    const { error: updateError } = await createClient().auth.updateUser({ password });
    setPending(false);

    if (updateError) return setError(t("errors.linkExpired"));

    setDone(true);
    setTimeout(
      () => window.location.assign(locale === "en" ? "/en/my-page" : "/my-page"),
      1200,
    );
  }

  return (
    <AuthCard title={t("resetTitle")}>
      <form onSubmit={onSubmit} className="space-y-5">
        {error && <Notice tone="error">{error}</Notice>}
        {done && <Notice tone="info">{t("messages.passwordUpdated")}</Notice>}
        <Field
          label={t("newPassword")}
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
        <Field
          label={t("confirmPassword")}
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
        />
        <button
          disabled={pending || done}
          className="w-full rounded-full bg-brand py-3.5 font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
        >
          {pending ? t("working") : t("savePassword")}
        </button>
      </form>
    </AuthCard>
  );
}