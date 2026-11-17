"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { cancelStaleOrdersAction } from "@/lib/actions/admin-orders";

export default function StaleOrdersButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  async function run() {
    if (
      !window.confirm(
        "Cancel unpaid online orders older than 2 hours and bank transfer orders without a deposit after 72 hours? Their items go back in stock.",
      )
    ) {
      return;
    }
    setBusy(true);
    setNote(null);
    const result = await cancelStaleOrdersAction();
    setBusy(false);

    if (result.ok) {
      setNote(
        result.count === 0
          ? "Nothing to cancel."
          : `${result.count} order(s) cancelled and restocked.`,
      );
      router.refresh();
    } else {
      setNote(result.error);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        onClick={run}
        disabled={busy}
        className="rounded-full border border-ink px-5 py-2 text-sm font-semibold hover:bg-ink hover:text-white disabled:opacity-50"
      >
        {busy ? "Working..." : "Cancel stale unpaid orders"}
      </button>
      {note && <span className="text-sm text-muted">{note}</span>}
    </div>
  );
}