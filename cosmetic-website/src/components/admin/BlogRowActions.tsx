"use client";

import { useTransition } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { deletePostAction, togglePublishedAction } from "@/lib/actions/blog";

type Props = { id: string; isPublished: boolean; title: string };

export default function BlogRowActions({ id, isPublished, title }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function toggle() {
    startTransition(async () => {
      const result = await togglePublishedAction(id, !isPublished);
      if (!result.ok) window.alert(result.error);
      router.refresh();
    });
  }

  function remove() {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    startTransition(async () => {
      const result = await deletePostAction(id);
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
        {isPublished ? "Unpublish" : "Publish"}
      </button>
      <Link href={`/admin/blog/${id}`} className="font-semibold text-brand hover:underline">
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