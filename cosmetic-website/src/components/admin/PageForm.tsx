"use client";

import { useState } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { updateSitePageAction, type PageResult } from "@/lib/actions/pages";
import MarkdownField from "./MarkdownField";

type Props = {
  slug: string;
  initial: { titleKo: string; titleEn: string; contentKo: string; contentEn: string };
  isFaq: boolean;
};

const inputClass =
  "mt-1.5 w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm outline-none transition-colors focus:border-brand";

export default function PageForm({ slug, initial, isFaq }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<PageResult | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setBusy(true);
    setResult(null);
    const res = await updateSitePageAction(slug, formData);
    setBusy(false);
    setResult(res);
    if (res.ok) router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {result && !result.ok && (
        <p role="alert" className="rounded-xl bg-brand-soft px-4 py-3 text-sm font-medium text-brand-dark">
          {result.error}
        </p>
      )}
      {result?.ok && result.message && (
        <p role="status" className="rounded-xl bg-green-100 px-4 py-3 text-sm font-medium text-green-800">
          {result.message}
        </p>
      )}

      <section className="rounded-2xl border border-line bg-white p-6">
        <div className="grid gap-5 md:grid-cols-2">
          <label className="block text-sm font-medium">
            Title (Korean)
            <input name="titleKo" defaultValue={initial.titleKo} className={inputClass} required />
          </label>
          <label className="block text-sm font-medium">
            Title (English)
            <input name="titleEn" defaultValue={initial.titleEn} className={inputClass} required />
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-line bg-white p-6">
        <p className="mb-5 text-xs text-muted">
          Markdown: <code>## Heading</code>, <code>**bold**</code>, <code>- list item</code>,{" "}
          <code>[link text](https://...)</code>.
          {isFaq && (
            <>
              {" "}
              <strong>FAQ:</strong> write each question as <code>### Question</code> and the answer on the
              lines below it.
            </>
          )}
        </p>
        <div className="grid gap-6">
          <MarkdownField label="Text (Korean)" name="contentKo" defaultValue={initial.contentKo} />
          <MarkdownField label="Text (English)" name="contentEn" defaultValue={initial.contentEn} />
        </div>
      </section>

      <div className="flex items-center gap-4">
        <button
          disabled={busy}
          className="rounded-full bg-brand px-8 py-3 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
        >
          {busy ? "Saving..." : "Save changes"}
        </button>
        <Link href="/admin/pages" className="text-sm text-muted underline">
          Back to pages
        </Link>
      </div>
    </form>
  );
}