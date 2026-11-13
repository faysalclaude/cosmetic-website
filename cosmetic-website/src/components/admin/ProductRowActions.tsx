"use client";

import { useTransition } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { deleteProductAction, toggleActiveAction } from "@/lib/actions/products";

type Props = { id: string; isActive: boolean; name: string };

export default function ProductRowActions({ id, isActive, name }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function toggle() {
    startTransition(async () => {
      const result = await toggleActiveAction(id, !isActive);
      if (!result.ok) window.alert(result.error);
      router.refresh();
    });
  }

  function remove() {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    startTransition(async () => {
      const result = await deleteProductAction(id);
      if (!result.ok) window.alert(result.error);
      router.refresh();
    });
  }

  return (
    <div className="flex items-center justify-end gap-3 text-sm">
      <button
        onClick={toggle}
        disabled={pending}
        className="font-medium text-muted hover:text-ink disabled:opacity-50"
      >
        {isActive ? "Hide" : "Show"}
      </button>
      <Link href={`/admin/products/${id}`} className="font-semibold text-brand hover:underline">
        Edit
      </Link>
      <button
        onClick={remove}
        disabled={pending}
        className="font-medium text-brand-dark hover:underline disabled:opacity-50"
      >
        Delete
      </button>
    </div>
  );
}