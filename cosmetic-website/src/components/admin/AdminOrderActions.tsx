"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { setOrderStatusAction, setTrackingAction } from "@/lib/actions/admin-orders";
import { ACTION_LABEL, type OrderStatus } from "@/lib/orders";

type Props = {
  orderId: string;
  status: OrderStatus;
  next: OrderStatus[];
  carrier: string;
  trackingNo: string;
};

type Msg = { tone: "ok" | "error"; text: string } | null;

export default function AdminOrderActions({ orderId, status, next, carrier, trackingNo }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<Msg>(null);

  async function go(to: OrderStatus) {
    if (
      (to === "cancelled" || to === "refunded") &&
      !window.confirm(`${ACTION_LABEL[to]}? This puts the items back in stock and cannot be undone.`)
    ) {
      return;
    }
    setBusy(true);
    setMessage(null);
    const result = await setOrderStatusAction(orderId, to);
    setBusy(false);
    if (result.ok) {
      setMessage({ tone: "ok", text: "Order updated." });
      router.refresh();
    } else {
      setMessage({ tone: "error", text: result.error });
    }
  }

  async function saveTracking(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setBusy(true);
    setMessage(null);
    const result = await setTrackingAction(
      orderId,
      String(form.get("carrier") ?? ""),
      String(form.get("trackingNo") ?? ""),
    );
    setBusy(false);
    if (result.ok) {
      setMessage({ tone: "ok", text: "Tracking saved. The customer sees it on the order page." });
      router.refresh();
    } else {
      setMessage({ tone: "error", text: result.error });
    }
  }

  const showTracking = ["preparing", "shipped", "delivered"].includes(status);

  return (
    <div className="space-y-5">
      {next.length > 0 ? (
        <div className="flex flex-col gap-2">
          {next.map((to) => {
            const destructive = to === "cancelled" || to === "refunded";
            return (
              <button
                key={to}
                onClick={() => go(to)}
                disabled={busy}
                className={`rounded-full px-5 py-3 text-sm font-semibold disabled:opacity-50 ${
                  destructive
                    ? "border border-line text-brand-dark hover:border-brand"
                    : "bg-brand text-white hover:bg-brand-dark"
                }`}
              >
                {ACTION_LABEL[to]}
              </button>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-muted">This order is closed. No further changes are possible.</p>
      )}

      {showTracking && (
        <form onSubmit={saveTracking} className="space-y-3 rounded-2xl bg-cream p-4">
          <p className="text-sm font-semibold">Tracking</p>
          <input
            name="carrier"
            defaultValue={carrier}
            placeholder="Carrier (e.g. CJ Logistics)"
            className="w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-brand"
          />
          <input
            name="trackingNo"
            defaultValue={trackingNo}
            placeholder="Tracking number"
            className="w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-brand"
          />
          <button
            disabled={busy}
            className="rounded-full border border-ink px-5 py-2 text-sm font-semibold hover:bg-ink hover:text-white disabled:opacity-50"
          >
            Save tracking
          </button>
        </form>
      )}

      {message && (
        <p
          role={message.tone === "error" ? "alert" : "status"}
          className={`rounded-xl px-4 py-3 text-sm font-medium ${
            message.tone === "error" ? "bg-brand-soft text-brand-dark" : "bg-green-100 text-green-800"
          }`}
        >
          {message.text}
        </p>
      )}
    </div>
  );
}