"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

export default function NewsletterForm() {
  const t = useTranslations("Footer");
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    // TODO (Phase 6): POST to /api/newsletter and save in Supabase
    setDone(true);
    setEmail("");
  }

  if (done) return <p className="text-sm text-brand-soft">{t("subscribed")}</p>;

  return (
    <form onSubmit={onSubmit} className="flex gap-2">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={t("emailPlaceholder")}
        className="min-w-0 flex-1 rounded-full bg-white/10 px-4 py-2 text-sm text-white placeholder:text-white/40 outline-none focus:bg-white/20"
      />
      <button className="rounded-full bg-brand px-4 py-2 text-sm font-medium hover:bg-brand-dark">
        {t("subscribe")}
      </button>
    </form>
  );
}