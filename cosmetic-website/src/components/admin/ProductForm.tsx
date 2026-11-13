"use client";

import { useActionState, useEffect, useState } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import {
  createProductAction,
  updateProductAction,
  type ProductActionResult,
} from "@/lib/actions/products";
import type { CategoryOption, ProductFormValues } from "@/types/admin";

const empty: ProductFormValues = {
  slug: "",
  categoryId: "skinCare",
  nameKo: "",
  nameEn: "",
  heroTagKo: "",
  heroTagEn: "",
  areaKo: "",
  areaEn: "",
  summaryKo: "",
  summaryEn: "",
  howToUseKo: "",
  howToUseEn: "",
  highlightsKo: "",
  highlightsEn: "",
  price: "",
  compareAt: "",
  stock: "100",
  tint: "#fcf0f4",
  accent: "#e81c68",
  isNew: false,
  isActive: true,
  sortOrder: "10",
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

function Label({
  text,
  hint,
  full,
  children,
}: {
  text: string;
  hint?: string;
  full?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className={`block text-sm font-medium ${full ? "md:col-span-2" : ""}`}>
      {text}
      {children}
      {hint && <span className="mt-1 block text-xs font-normal text-muted">{hint}</span>}
    </label>
  );
}

type Props = {
  categories: CategoryOption[];
  initial?: ProductFormValues;
  id?: string;
};

export default function ProductForm({ categories, initial, id }: Props) {
  const router = useRouter();
  const editing = Boolean(id);
  const v = initial ?? empty;

  const action: (
    prev: ProductActionResult | null,
    fd: FormData,
  ) => Promise<ProductActionResult> = id
    ? updateProductAction.bind(null, id)
    : createProductAction;

  const [state, formAction, pending] = useActionState<ProductActionResult | null, FormData>(
    action,
    null,
  );
  const [slug, setSlug] = useState(v.slug);
  const [slugTouched, setSlugTouched] = useState(false);

  useEffect(() => {
    if (state?.ok && state.id && !editing) {
      router.push(`/admin/products/${state.id}`);
    }
  }, [state, editing, router]);

  // Submit through startTransition-free manual dispatch so typed values are NOT wiped on errors.
  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    formAction(new FormData(e.currentTarget));
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {state && !state.ok && (
        <p role="alert" className="rounded-xl bg-brand-soft px-4 py-3 text-sm font-medium text-brand-dark">
          {state.error}
        </p>
      )}
      {state?.ok && state.message && (
        <p role="status" className="rounded-xl bg-green-100 px-4 py-3 text-sm font-medium text-green-800">
          {state.message}
        </p>
      )}

      <Section title="Basics">
        <Label text="Category">
          <select name="categoryId" defaultValue={v.categoryId} className={inputClass}>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name_en} / {c.name_ko}
              </option>
            ))}
          </select>
        </Label>
        <Label
          text="Slug (the page address)"
          hint={
            editing
              ? "Locked: changing it would break the public link."
              : "Suggested from the English name. Lowercase letters, numbers, hyphens."
          }
        >
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
        </Label>
      </Section>

      <Section title="Names">
        <Label text="Name (Korean)">
          <input name="nameKo" defaultValue={v.nameKo} className={inputClass} required />
        </Label>
        <Label text="Name (English)">
          <input
            name="nameEn"
            defaultValue={v.nameEn}
            className={inputClass}
            required
            onChange={(e) => {
              if (!editing && !slugTouched) setSlug(slugify(e.target.value));
            }}
          />
        </Label>
        <Label text="Hero title (Korean)" hint="Big title in the home slider, e.g. 젠틀 클렌저">
          <input name="heroTagKo" defaultValue={v.heroTagKo} className={inputClass} />
        </Label>
        <Label text="Hero title (English)">
          <input name="heroTagEn" defaultValue={v.heroTagEn} className={inputClass} />
        </Label>
        <Label text="Area (Korean)" hint="Small label on the card, e.g. 얼굴">
          <input name="areaKo" defaultValue={v.areaKo} className={inputClass} />
        </Label>
        <Label text="Area (English)" hint="e.g. Face, Eyes">
          <input name="areaEn" defaultValue={v.areaEn} className={inputClass} />
        </Label>
      </Section>

      <Section title="Descriptions">
        <Label text="Summary (Korean)">
          <textarea name="summaryKo" defaultValue={v.summaryKo} rows={4} className={inputClass} />
        </Label>
        <Label text="Summary (English)">
          <textarea name="summaryEn" defaultValue={v.summaryEn} rows={4} className={inputClass} />
        </Label>
        <Label text="Highlights (Korean)" hint="One point per line, up to 10">
          <textarea name="highlightsKo" defaultValue={v.highlightsKo} rows={4} className={inputClass} />
        </Label>
        <Label text="Highlights (English)" hint="One point per line, up to 10">
          <textarea name="highlightsEn" defaultValue={v.highlightsEn} rows={4} className={inputClass} />
        </Label>
        <Label text="How to use (Korean)">
          <textarea name="howToUseKo" defaultValue={v.howToUseKo} rows={3} className={inputClass} />
        </Label>
        <Label text="How to use (English)">
          <textarea name="howToUseEn" defaultValue={v.howToUseEn} rows={3} className={inputClass} />
        </Label>
      </Section>

      <Section title="Price and stock">
        <Label text="Price (KRW)" hint="Digits only, e.g. 32000">
          <input name="price" inputMode="numeric" defaultValue={v.price} className={inputClass} required />
        </Label>
        <Label text="Compare-at price (KRW, optional)" hint="The old, crossed-out price. The discount % is calculated automatically.">
          <input name="compareAt" inputMode="numeric" defaultValue={v.compareAt} className={inputClass} />
        </Label>
        <Label text="Stock">
          <input name="stock" inputMode="numeric" defaultValue={v.stock} className={inputClass} required />
        </Label>
        <Label text="Sort order" hint="Smaller numbers appear first">
          <input name="sortOrder" inputMode="numeric" defaultValue={v.sortOrder} className={inputClass} required />
        </Label>
      </Section>

      <Section title="Look and visibility">
        <Label text="Background tint" hint="Soft colour behind the product">
          <input type="color" name="tint" defaultValue={v.tint} className="mt-1.5 h-11 w-full cursor-pointer rounded-xl border border-line bg-white p-1" />
        </Label>
        <Label text="Accent colour" hint="Brand colour of this product">
          <input type="color" name="accent" defaultValue={v.accent} className="mt-1.5 h-11 w-full cursor-pointer rounded-xl border border-line bg-white p-1" />
        </Label>
        <label className="flex items-center gap-3 text-sm font-medium">
          <input type="checkbox" name="isActive" defaultChecked={v.isActive} className="h-4 w-4 accent-[var(--color-brand)]" />
          Show on the website
        </label>
        <label className="flex items-center gap-3 text-sm font-medium">
          <input type="checkbox" name="isNew" defaultChecked={v.isNew} className="h-4 w-4 accent-[var(--color-brand)]" />
          Show the NEW badge
        </label>
      </Section>

      <div className="flex items-center gap-4">
        <button
          disabled={pending}
          className="rounded-full bg-brand px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
        >
          {pending ? "Saving..." : editing ? "Save changes" : "Create product"}
        </button>
        <Link href="/admin/products" className="text-sm text-muted underline">
          Back to products
        </Link>
      </div>
    </form>
  );
}