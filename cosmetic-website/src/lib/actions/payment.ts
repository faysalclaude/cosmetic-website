"use server";

import { createClient } from "@/lib/supabase/server";
import { verifyAndMarkPaid } from "@/lib/payment-server";

export type ConfirmResult = { ok: true } | { ok: false; error: string };

export async function confirmPaymentAction(
  orderNo: string,
  paymentId: string,
): Promise<ConfirmResult> {
  if (!/^BM\d{6}-\d{5}$/.test(orderNo) || paymentId.length > 100) {
    return { ok: false, error: "Invalid request." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "You need to log in." };

  // Row Level Security: the customer can only see their own orders
  const { data: own } = await supabase
    .from("orders")
    .select("id")
    .eq("order_no", orderNo)
    .maybeSingle();
  if (!own) return { ok: false, error: "Order not found." };

  const result = await verifyAndMarkPaid(orderNo, paymentId);
  return result.ok ? { ok: true } : { ok: false, error: result.error };
}