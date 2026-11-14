import "server-only";
import { PaymentClient } from "@portone/server-sdk";
import { CancelPaymentError, isUnrecognizedPayment } from "@portone/server-sdk/payment";
import { createAdminClient } from "@/lib/supabase/admin";

type Fail = { ok: false; error: string; retryable?: boolean };
export type VerifyResult = { ok: true } | Fail;

function client() {
  const secret = process.env.PORTONE_API_SECRET;
  if (!secret) throw new Error("Missing PORTONE_API_SECRET");
  return PaymentClient({ secret });
}

// Asks PortOne whether the payment really happened, then marks the order paid.
// Used by the confirm action AND the webhook.
export async function verifyAndMarkPaid(orderNo: string, paymentId: string): Promise<VerifyResult> {
  if (!paymentId.startsWith(`${orderNo}_`)) {
    return { ok: false, error: "This payment does not belong to the order." };
  }

  const admin = createAdminClient();
  const { data: order } = await admin
    .from("orders")
    .select("id, total, payment_method")
    .eq("order_no", orderNo)
    .maybeSingle();

  if (!order) return { ok: false, error: "Order not found." };
  if (order.payment_method === "bank_transfer") {
    return { ok: false, error: "This order is not an online payment order." };
  }

  let payment;
  try {
    payment = await client().getPayment({ paymentId });
  } catch (err) {
    console.error("PortOne getPayment failed", err);
    return { ok: false, error: "Could not verify the payment with PortOne.", retryable: true };
  }

  if (isUnrecognizedPayment(payment)) {
    return { ok: false, error: "PortOne returned an unrecognised response.", retryable: true };
  }
  if (payment.status !== "PAID") {
    return { ok: false, error: `The payment is not completed (${payment.status}).` };
  }
  if (payment.currency !== "KRW" || payment.amount.total !== order.total) {
    console.error("Payment amount mismatch", { orderNo, paymentId });
    return { ok: false, error: "The paid amount does not match the order." };
  }

  const { error } = await admin.rpc("mark_order_paid", {
    p_order_id: order.id,
    p_payment_id: paymentId,
  });
  if (error) {
    if (error.message.includes("ORDER_NOT_PAYABLE")) {
      console.error("Paid order is no longer payable", { orderNo, paymentId });
      return {
        ok: false,
        error: "This order can no longer be paid (it may have been cancelled). Please contact the shop.",
      };
    }
    return { ok: false, error: error.message.slice(0, 200), retryable: true };
  }

  return { ok: true };
}

// Real refund through PortOne. Already-cancelled payments count as success.
export async function cancelOnlinePayment(paymentId: string, reason: string): Promise<VerifyResult> {
  try {
    await client().cancelPayment({ paymentId, reason });
    return { ok: true };
  } catch (err) {
    if (err instanceof CancelPaymentError && err.data.type === "PAYMENT_ALREADY_CANCELLED") {
      return { ok: true };
    }
    console.error("PortOne cancelPayment failed", err);
    return {
      ok: false,
      error:
        "PortOne could not cancel the payment. Refund it in the PortOne console, then try again.",
    };
  }
}