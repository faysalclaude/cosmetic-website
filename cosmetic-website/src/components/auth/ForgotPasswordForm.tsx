"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { forgotPasswordAction, type ActionResult } from "@/lib/actions/auth";
import AuthCard, { Notice } from "./AuthCard";
import Field from "./Field";
import { useAuthMessage } from "./use-auth-message";

export default function ForgotPasswordForm() {
  const t = useTranslations("Auth");
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    forgotPasswordAction,
    null,
  );
  const { error, info } = useAuthMessage(state);

  return (
    <AuthCard
      title={t("forgotTitle")}
      subtitle={t("forgotSubtitle")}
      footer={
        <Link href="/login" className="font-semibold text-brand">
          {t("backToLogin")}
        </Link>
      }
    >
      <form action={formAction} className="space-y-5">
        {error && <Notice tone="error">{error}</Notice>}
        {info && <Notice tone="info">{info}</Notice>}
        <Field label={t("email")} name="email" type="email" autoComplete="email" required />
        <button
          disabled={pending}
          className="w-full rounded-full bg-brand py-3.5 font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
        >
          {pending ? t("working") : t("sendLink")}
        </button>
      </form>
    </AuthCard>
  );
}