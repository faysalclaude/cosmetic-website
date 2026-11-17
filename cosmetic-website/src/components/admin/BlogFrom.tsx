"use client";

import { useState } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/browser";
import { toOptimizedImage } from "@/lib/image-utils";
import { BUCKET } from "@/lib/storage";
import {
  createBlogUploadUrlAction,
  createPostAction,
  updatePostAction,
  type BlogResult,
} from "@/lib/actions/blog";
import Markdown from "@/components/blog/Markdown";
import type { BlogFormValues } from "@/types/admin";

const empty: BlogFormValues = {
  slug: "",
  categoryKo: "",
  categoryEn: "",
  titleKo: "",
  titleEn: "",
  excerptKo: "",
  excerptEn: "",
  contentKo: "",
  contentEn: "",
  coverUrl: "",
  isPublished: false,
};

const slugify = (v: string) =>
  v
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);

const inputClass =
  "mt-1.5 w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm outline-none transition-colors focus:border-brand read-only:bg-cream read-only:text-muted";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-line bg-white p-6">
      <h2 className="mb-5 text-base font-semibold">{title}</h2>
      <div className="grid gap-5 md:grid-cols-2">{children}</div>
    </section>
  );
}

function ContentField({
  label,
  name,
  defaultValue,
}: {
  label: string;
  name: string;
  defaultValue: string;
}) {
  const [text, setText] = useState(defaultValue);
  const [preview, setPreview] = useState(false);

  return (
    <div className="md:col-span-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        <button
          type="button"
          onClick={() => setPreview((v) => !v)}
          className="rounded-full border border-line px-3 py-1 text-xs font-medium hover:border-brand hover:text-brand"
        >
          {preview ? "Edit" : "Preview"}
        </button>
      </div>
      {/* the textarea stays in the page while previewing so its text is still saved */}
      <textarea
        name={name}
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={14}
        className={`${inputClass} font-mono ${preview ? "hidden" : ""}`}
      />
      {preview && (
        <div className="mt-1.5 min-h-40 rounded-xl border border-line bg-white p-5">
          <Markdown>{text || "_Nothing to preview yet._"}</Markdown>
        </div>
      )}
    </div>
  );
}

type Props = { id?: string; initial?: BlogFormValues };

export default function BlogForm({ id, initial }: Props) {
  const router = useRouter();
  const editing = Boolean(id);
  const v = initial ?? empty;

  const [slug, setSlug] = useState(v.slug);
  const [slugTouched, setSlugTouched] = useState(false);
  const [coverUrl, setCoverUrl] = useState(v.coverUrl);
  const [uploading, setUploading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<BlogResult | null>(null);

  async function onCover(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setUploading(true);
    setResult(null);
    try {
      const { blob, ext } = await toOptimizedImage(file, 1600, 0.86);
      const prepared = await createBlogUploadUrlAction(ext);
      if (!prepared.ok) throw new Error(prepared.error);

      const { error } = await createClient()
        .storage.from(BUCKET)
        .uploadToSignedUrl(prepared.path, prepared.token, blob, { contentType: blob.type });
      if (error) throw new Error(error.message);

      setCoverUrl(prepared.publicUrl);
    } catch (err) {
      setResult({ ok: false, error: err instanceof Error ? err.message : "Upload failed." });
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setBusy(true);
    setResult(null);

    const res = id ? await updatePostAction(id, formData) : await createPostAction(formData);
    setBusy(false);
    setResult(res);

    if (res.ok) {
      if (!editing && res.id) router.push(`/admin/blog/${res.id}`);
      else router.refresh();
    }
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

      <Section title="Titles and address">
        <label className="block text-sm font-medium">
          Title (Korean)
          <input name="titleKo" defaultValue={v.titleKo} className={inputClass} required />
        </label>
        <label className="block text-sm font-medium">
          Title (English)
          <input
            name="titleEn"
            defaultValue={v.titleEn}
            className={inputClass}
            required
            onChange={(e) => {
              if (!editing && !slugTouched) setSlug(slugify(e.target.value));
            }}
          />
        </label>
        <label className="block text-sm font-medium md:col-span-2">
          Slug (the page address)
          <input
            name="slug"
            value={slug}
            readOnly={editing}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(e.target.value);
            }}
            className={inputClass}
            required
          />
          <span className="mt-1 block text-xs font-normal text-muted">
            {editing
              ? "Locked: changing it would break the public link."
              : "Suggested from the English title. Lowercase letters, numbers, hyphens."}
          </span>
        </label>
        <label className="block text-sm font-medium">
          Category (Korean)
          <input name="categoryKo" defaultValue={v.categoryKo} placeholder="뷰티 팁" className={inputClass} />
        </label>
        <label className="block text-sm font-medium">
          Category (English)
          <input name="categoryEn" defaultValue={v.categoryEn} placeholder="Beauty Tips" className={inputClass} />
        </label>
        <label className="block text-sm font-medium">
          Short summary (Korean)
          <textarea name="excerptKo" defaultValue={v.excerptKo} rows={2} className={inputClass} />
        </label>
        <label className="block text-sm font-medium">
          Short summary (English)
          <textarea name="excerptEn" defaultValue={v.excerptEn} rows={2} className={inputClass} />
        </label>
      </Section>

      <section className="rounded-2xl border border-line bg-white p-6">
        <h2 className="mb-4 text-base font-semibold">Cover image</h2>
        <input type="hidden" name="coverUrl" value={coverUrl} />
        <div className="flex flex-wrap items-center gap-5">
          <div className="flex h-32 w-48 items-center justify-center overflow-hidden rounded-xl border border-line bg-cream text-xs text-muted">
            {coverUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={coverUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              "No cover"
            )}
          </div>
          <div className="space-y-2">
            <label className="inline-block cursor-pointer rounded-full border border-ink px-5 py-2.5 text-sm font-semibold hover:bg-ink hover:text-white">
              {uploading ? "Uploading..." : coverUrl ? "Replace image" : "Upload image"}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={onCover}
                disabled={uploading}
                className="hidden"
              />
            </label>
            {coverUrl && (
              <button
                type="button"
                onClick={() => setCoverUrl("")}
                className="ml-3 text-sm text-brand-dark underline"
              >
                Remove
              </button>
            )}
            <p className="text-xs text-muted">Wide photos (3:2 or 16:9) look best.</p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-line bg-white p-6">
        <h2 className="mb-1 text-base font-semibold">Article text</h2>
        <p className="mb-5 text-xs text-muted">
          Markdown: <code>## Heading</code>, <code>**bold**</code>, <code>- list item</code>,{" "}
          <code>[link text](https://...)</code>, <code>![description](image-address)</code>. Use Preview to check.
        </p>
        <div className="grid gap-6">
          <ContentField label="Text (Korean)" name="contentKo" defaultValue={v.contentKo} />
          <ContentField label="Text (English)" name="contentEn" defaultValue={v.contentEn} />
        </div>
      </section>

      <section className="rounded-2xl border border-line bg-white p-6">
        <label className="flex items-center gap-3 text-sm font-medium">
          <input
            type="checkbox"
            name="isPublished"
            defaultChecked={v.isPublished}
            className="h-4 w-4 accent-[var(--color-brand)]"
          />
          Publish on the website (untick to keep it as a draft)
        </label>
      </section>

      <div className="flex items-center gap-4">
        <button
          disabled={busy || uploading}
          className="rounded-full bg-brand px-8 py-3 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
        >
          {busy ? "Saving..." : editing ? "Save changes" : "Create post"}
        </button>
        <Link href="/admin/blog" className="text-sm text-muted underline">
          Back to blog
        </Link>
      </div>
    </form>
  );
}