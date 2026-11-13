"use client";

import { useState } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import {
  createCategoryAction,
  deleteCategoryAction,
  updateCategoryAction,
  type CategoryResult,
} from "@/lib/actions/categories";

export type CategoryRowData = {
  id: string;
  nameKo: string;
  nameEn: string;
  descKo: string;
  descEn: string;
  sortOrder: number;
  productCount: number;
};

const inputClass =
  "mt-1.5 w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm outline-none transition-colors focus:border-brand";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);

function Notice({ result }: { result: CategoryResult | null }) {
  if (!result) return null;

  if (!result.ok) {
    return (
      <p
        role="alert"
        className="rounded-xl bg-brand-soft px-4 py-2.5 text-sm font-medium text-brand-dark"
      >
        {result.error}
      </p>
    );
  }

  return result.message ? (
    <p
      role="status"
      className="rounded-xl bg-green-100 px-4 py-2.5 text-sm font-medium text-green-800"
    >
      {result.message}
    </p>
  ) : null;
}

function CategoryFields({ cat }: { cat?: CategoryRowData }) {
  return (
    <>
      <label className="block text-sm font-medium">
        Name (Korean)
        <input name="nameKo" defaultValue={cat?.nameKo} className={inputClass} required />
      </label>
      <label className="block text-sm font-medium">
        Name (English)
        <input name="nameEn" defaultValue={cat?.nameEn} className={inputClass} required />
      </label>
      <label className="block text-sm font-medium">
        Description (Korean)
        <textarea name="descKo" defaultValue={cat?.descKo} rows={2} className={inputClass} />
      </label>
      <label className="block text-sm font-medium">
        Description (English)
        <textarea name="descEn" defaultValue={cat?.descEn} rows={2} className={inputClass} />
      </label>
    </>
  );
}

function CategoryCard({ cat }: { cat: CategoryRowData }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<CategoryResult | null>(null);

  async function onSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setBusy(true);
    setResult(null);
    const res = await updateCategoryAction(cat.id, formData);
    setBusy(false);
    setResult(res);
    if (res.ok) router.refresh();
  }

  async function onDelete() {
    if (!window.confirm(`Delete the category "${cat.nameEn}"?`)) return;
    setBusy(true);
    const res = await deleteCategoryAction(cat.id);
    setBusy(false);
    if (res.ok) router.refresh();
    else setResult(res);
  }

  return (
    <form onSubmit={onSave} className="rounded-2xl border border-line bg-white p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-semibold">{cat.nameEn}</p>
          <p className="text-xs text-muted">
            Address: /category/{cat.id} · {cat.productCount} product
            {cat.productCount === 1 ? "" : "s"}
          </p>
        </div>
        <Link
          href={`/category/${cat.id}`}
          target="_blank"
          className="text-sm text-brand underline"
        >
          View on website
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <CategoryFields cat={cat} />
        <label className="block text-sm font-medium">
          Sort order
          <input
            name="sortOrder"
            inputMode="numeric"
            defaultValue={cat.sortOrder}
            className={inputClass}
            required
          />
          <span className="mt-1 block text-xs font-normal text-muted">
            Smaller numbers appear first.
          </span>
        </label>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          disabled={busy}
          className="rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
        >
          {busy ? "Working..." : "Save"}
        </button>
        <button
          type="button"
          onClick={onDelete}
          disabled={busy}
          className="rounded-full border border-line px-6 py-2.5 text-sm font-semibold text-brand-dark hover:border-brand disabled:opacity-60"
        >
          Delete
        </button>
        <Notice result={result} />
      </div>
    </form>
  );
}

function AddCategory() {
  const router = useRouter();
  const [id, setId] = useState("");
  const [idTouched, setIdTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<CategoryResult | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    setBusy(true);
    setResult(null);
    const res = await createCategoryAction(formData);
    setBusy(false);
    setResult(res);

    if (res.ok) {
      form.reset();
      setId("");
      setIdTouched(false);
      router.refresh();
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      onChange={(e) => {
        // fill the address from the English name until the admin edits the address by hand
        const target = e.target as HTMLInputElement;
        if (target.name === "nameEn" && !idTouched) setId(slugify(target.value));
      }}
      className="rounded-2xl border-2 border-dashed border-line bg-cream/60 p-6"
    >
      <h2 className="mb-4 font-semibold">Add a category</h2>

      <div className="grid gap-4 md:grid-cols-2">
        <CategoryFields />
        <label className="block text-sm font-medium">
          Address (in the link)
          <input
            name="id"
            value={id}
            onChange={(e) => {
              setIdTouched(true);
              setId(e.target.value);
            }}
            className={inputClass}
            required
          />
          <span className="mt-1 block text-xs font-normal text-muted">
            Suggested from the English name. It cannot be changed later.
          </span>
        </label>
        <label className="block text-sm font-medium">
          Sort order
          <input
            name="sortOrder"
            inputMode="numeric"
            defaultValue={10}
            className={inputClass}
            required
          />
        </label>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          disabled={busy}
          className="rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
        >
          {busy ? "Adding..." : "Add category"}
        </button>
        <Notice result={result} />
      </div>
    </form>
  );
}

export default function CategoryManager({
  categories,
}: {
  categories: CategoryRowData[];
}) {
  return (
    <div className="space-y-6">
      <AddCategory />
      {categories.map((cat) => (
        <CategoryCard key={cat.id} cat={cat} />
      ))}
    </div>
  );
}