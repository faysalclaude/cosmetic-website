"use client";

import { useActionState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { registerAction, type ActionResult } from "@/lib/actions/auth";
import AuthCard, { Notice } from "./AuthCard";
import Field from "./Field";
import { useAuthMessage } from "./use-auth-message";

export default function RegisterForm() {
  const t = useTranslations("Auth");
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    registerAction,
    null,
  );
  const { error, info } = useAuthMessage(state);

  useEffect(() => {
    if (state?.ok && state.redirectTo) window.location.assign(state.redirectTo);
  }, [state]);

  return (
    <AuthCard
      title={t("registerTitle")}
      subtitle={t("registerSubtitle")}
      footer={
        <>
          {t("haveAccount")}{" "}
          <Link href="/login" className="font-semibold text-brand">
            {t("login")}
          </Link>
        </>
      }
    >
      <form action={formAction} className="space-y-5">
        {error && <Notice tone="error">{error}</Notice>}
        {info && <Notice tone="info">{info}</Notice>}

        <Field label={t("fullName")} name="fullName" autoComplete="name" required />
        <Field label={t("email")} name="email" type="email" autoComplete="email" required />
        <Field label={t("phone")} name="phone" type="tel" autoComplete="tel" />
        <Field
          label={t("password")}
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

        <label className="flex items-start gap-2 text-sm text-muted">
          <input type="checkbox" name="agree" className="mt-1 accent-[var(--color-brand)]" />
          <span>
            {t("agreePrefix")}{" "}
            <Link href="/terms-and-services" className="underline">
              {t("terms")}
            </Link>
            {t("and")}
            <Link href="/privacy-policy" className="underline">
              {t("privacy")}
            </Link>
          </span>
        </label>

        <button
          disabled={pending}
          className="w-full rounded-full bg-brand py-3.5 font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
        >
          {pending ? t("working") : t("register")}
        </button>
      </form>
    </AuthCard>
  );
}