"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { confirmPaymentAction } from "@/lib/actions/payment";

export default function PaymentComplete() {
  const t = useTranslations("Payment");
  const router = useRouter();
  const params = useSearchParams();

  const orderNo = params.get("orderNo") ?? "";
  const paymentId = params.get("paymentId") ?? "";
  const code = params.get("code");
  const redirectMessage = params.get("message");

  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderNo || !paymentId || code) return;
    let active = true;

    confirmPaymentAction(orderNo, paymentId).then((result) => {
      if (!active) return;
      if (result.ok) router.replace(`/orders/${orderNo}?placed=1`);
      else setServerError(result.error);
    });

    return () => {
      active = false;
    };
  }, [orderNo, paymentId, code, router]);

  const failed = Boolean(code) || !orderNo || !paymentId || serverError !== null;

  if (!failed) {
    return (
      <div className="container-page py-28 text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-line border-t-brand" />
        <p className="mt-6 text-muted">{t("verifying")}</p>
      </div>
    );
  }

  return (
    <div className="container-page flex flex-col items-center py-28 text-center">
      <h1 className="text-2xl font-bold">{t("failedTitle")}</h1>
      <p className="mt-3 max-w-md text-sm text-muted">{t("failedText")}</p>
      {(redirectMessage || serverError) && (
        <p className="mt-3 max-w-md text-xs text-muted">{redirectMessage ?? serverError}</p>
      )}
      <Link
        href={orderNo ? `/orders/${orderNo}?payment=failed` : "/my-page"}
        className="mt-6 rounded-full bg-brand px-8 py-3 text-sm font-semibold text-white hover:bg-brand-dark"
      >
        {t("backToOrder")}
      </Link>
    </div>
  );
}