"use client";

import { useActionState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { loginAction, type ActionResult } from "@/lib/actions/auth";
import AuthCard, { Notice } from "./AuthCard";
import Field from "./Field";
import { useAuthMessage } from "./use-auth-message";

export default function LoginForm() {
  const t = useTranslations("Auth");
  const params = useSearchParams();
  const next = params.get("next") ?? "";
  const linkError = params.get("error") === "link";

  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    loginAction,
    null,
  );
  const { error } = useAuthMessage(state);

  useEffect(() => {
    if (state?.ok && state.redirectTo) window.location.assign(state.redirectTo);
  }, [state]);

  return (
    <AuthCard
      title={t("loginTitle")}
      subtitle={t("loginSubtitle")}
      footer={
        <>
          {t("noAccount")}{" "}
          <Link href="/register" className="font-semibold text-brand">
            {t("register")}
          </Link>
        </>
      }
    >
      <form action={formAction} className="space-y-5">
        <input type="hidden" name="next" value={next} />
        {linkError && <Notice tone="error">{t("errors.linkExpired")}</Notice>}
        {error && <Notice tone="error">{error}</Notice>}

        <Field label={t("email")} name="email" type="email" autoComplete="email" required />
        <Field
          label={t("password")}
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />

        <div className="text-right text-sm">
          <Link href="/forgot-password" className="text-muted underline">
            {t("forgotLink")}
          </Link>
        </div>

        <button
          disabled={pending || (state?.ok === true && !!state.redirectTo)}
          className="w-full rounded-full bg-brand py-3.5 font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
        >
          {pending ? t("working") : t("login")}
        </button>
      </form>
    </AuthCard>
  );
}