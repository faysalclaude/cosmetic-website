import { Suspense } from "react";
import type { Metadata } from "next";
import PaymentComplete from "@/components/checkout/PaymentComplete";

export const metadata: Metadata = {
  title: "Payment",
  robots: { index: false, follow: false },
};

export default function PaymentCompletePage() {
  return (
    <Suspense fallback={null}>
      <PaymentComplete />
    </Suspense>
  );
}