"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { isOnlineMethod, isOnlineMethodEnabled, requestOnlinePayment } from "@/lib/payment";

type Props = {
  orderNo: string;
  total: number;
  method: string;
  orderName: string;
  recipient: string;
  phone: string;
  email?: string;
};

export default function PayNowButton({ orderNo, total, method, orderName, recipient, phone, email }: Props) {
  const t = useTranslations("Order");
  const locale = useLocale();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOnlineMethod(method) || !isOnlineMethodEnabled(method)) return null;

  async function pay() {
    if (!isOnlineMethod(method)) return;
    setBusy(true);
    setError(null);
    const result = await requestOnlinePayment({
      method,
      orderNo,
      total,
      orderName,
      recipient,
      phone,
      email,
      locale,
    });
    if (!result.ok) {
      setBusy(false);
      setError(result.message);
      return;
    }
    router.push(`/payment/complete?orderNo=${orderNo}&paymentId=${encodeURIComponent(result.paymentId)}`);
  }

  return (
    <div className="mt-4">
      <button
        onClick={pay}
        disabled={busy}
        className="rounded-full bg-brand px-10 py-3.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
      >
        {busy ? t("payWorking") : t("payNow")}
      </button>
      {error && <p className="mt-3 text-sm text-brand-dark">{error}</p>}
    </div>
  );
}