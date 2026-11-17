"use client";

import { useTransition } from "react";
import { useRouter } from "@/i18n/navigation";
import { deleteMessageAction, setMessageReadAction } from "@/lib/actions/admin-messages";

type Props = { id: string; isRead: boolean; email: string; subject: string | null };

export default function MessageActions({ id, isRead, email, subject }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function toggle() {
    startTransition(async () => {
      const result = await setMessageReadAction(id, !isRead);
      if (!result.ok) window.alert(result.error);
      router.refresh();
    });
  }

  function remove() {
    if (!window.confirm("Delete this message? This cannot be undone.")) return;
    startTransition(async () => {
      const result = await deleteMessageAction(id);
      if (!result.ok) window.alert(result.error);
      router.refresh();
    });
  }

  const reply = `mailto:${email}?subject=${encodeURIComponent(`Re: ${subject || "Your enquiry"}`)}`;

  return (
    <div className="flex flex-wrap items-center gap-3 text-sm">
      <a href={reply} className="rounded-full bg-brand px-4 py-1.5 font-semibold text-white hover:bg-brand-dark">
        Reply by email
      </a>
      <button
        onClick={toggle}
        disabled={pending}
        className="font-medium text-muted hover:text-ink disabled:opacity-50"
      >
        {isRead ? "Mark as unread" : "Mark as read"}
      </button>
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