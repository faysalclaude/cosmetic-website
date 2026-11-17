"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { submitContactAction } from "@/lib/actions/contact";

const inputClass =
  "mt-1.5 w-full rounded-xl border border-line bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-brand";

const initial = { name: "", email: "", phone: "", subject: "", message: "", website: "" };

export default function ContactForm() {
  const t = useTranslations("Contact");
  const [values, setValues] = useState(initial);
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (key: keyof typeof initial) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => setValues((v) => ({ ...v, [key]: e.target.value }));

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const result = await submitContactAction({ ...values, agree });
    setBusy(false);

    if (result.ok) {
      setDone(true);
      setValues(initial);
      setAgree(false);
    } else {
      setError(result.error);
    }
  }

  if (done) {
    return (
      <div className="rounded-3xl bg-brand-soft p-10 text-center">
        <h2 className="text-xl font-bold text-brand-dark">{t("thanksTitle")}</h2>
        <p className="mt-2 text-sm text-muted">{t("thanksText")}</p>
        <button
          onClick={() => setDone(false)}
          className="mt-6 rounded-full border border-ink px-6 py-2.5 text-sm font-semibold hover:bg-ink hover:text-white"
        >
          {t("sendAnother")}
        </button>
      </div>
    );
  }

  const errorKey = `errors.${error}`;
  const errorText = error ? (t.has(errorKey) ? t(errorKey) : t("errors.generic")) : null;

  return (
    <form onSubmit={onSubmit} className="space-y-5 rounded-3xl border border-line bg-white p-6 md:p-8">
      <div className="grid gap-5 md:grid-cols-2">
        <label className="block text-sm font-medium">
          {t("name")}
          <input value={values.name} onChange={set("name")} autoComplete="name" className={inputClass} required />
        </label>
        <label className="block text-sm font-medium">
          {t("emailLabel")}
          <input
            type="email"
            value={values.email}
            onChange={set("email")}
            autoComplete="email"
            className={inputClass}
            required
          />
        </label>
        <label className="block text-sm font-medium">
          {t("phone")}
          <input type="tel" value={values.phone} onChange={set("phone")} autoComplete="tel" className={inputClass} />
        </label>
        <label className="block text-sm font-medium">
          {t("subject")}
          <input value={values.subject} onChange={set("subject")} className={inputClass} />
        </label>
      </div>

      <label className="block text-sm font-medium">
        {t("message")}
        <textarea value={values.message} onChange={set("message")} rows={6} className={inputClass} required />
      </label>

      {/* hidden trap field for bots; people never see or fill it */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Website
          <input
            tabIndex={-1}
            autoComplete="off"
            value={values.website}
            onChange={set("website")}
          />
        </label>
      </div>

      <label className="flex items-start gap-2 text-sm text-muted">
        <input
          type="checkbox"
          checked={agree}
          onChange={(e) => setAgree(e.target.checked)}
          className="mt-1 accent-[var(--color-brand)]"
        />
        <span>
          {t("agree")}{" "}
          <Link href="/privacy-policy" className="underline">
            {t("privacyLink")}
          </Link>
        </span>
      </label>

      {errorText && (
        <p role="alert" className="rounded-xl bg-brand-soft px-4 py-3 text-sm font-medium text-brand-dark">
          {errorText}
        </p>
      )}

      <button
        disabled={busy}
        className="rounded-full bg-brand px-10 py-3.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
      >
        {busy ? t("sending") : t("send")}
      </button>
    </form>
  );
}