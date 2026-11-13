"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { updateProfileAction, type ActionResult } from "@/lib/actions/auth";
import { Notice } from "./AuthCard";
import Field from "./Field";
import { useAuthMessage } from "./use-auth-message";

type Props = { email: string; fullName: string; phone: string };

export default function ProfileForm({ email, fullName, phone }: Props) {
  const t = useTranslations("Auth");
  const tm = useTranslations("MyPage");
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    updateProfileAction,
    null,
  );
  const { error, info } = useAuthMessage(state);

  return (
    <form action={formAction} className="space-y-5">
      {error && <Notice tone="error">{error}</Notice>}
      {info && <Notice tone="info">{info}</Notice>}
      <Field label={t("email")} value={email} readOnly disabled />
      <Field label={t("fullName")} name="fullName" defaultValue={fullName} required />
      <Field label={t("phone")} name="phone" type="tel" defaultValue={phone} />
      <button
        disabled={pending}
        className="rounded-full bg-brand px-8 py-3 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
      >
        {pending ? t("working") : tm("save")}
      </button>
    </form>
  );
}