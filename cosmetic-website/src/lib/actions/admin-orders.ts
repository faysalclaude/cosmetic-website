"use server";

import { assertAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { NEXT_STATUSES, PAYMENT_STATUS_FOR, isOrderStatus } from "@/lib/orders";

type Fail = { ok: false; error: string };
type Result = { ok: true } | Fail;

const isUuid = (v: string) => /^[0-9a-f-]{36}$/i.test(v);
const fail = (error: string): Fail => ({ ok: false, error });
const short = (m: string) => m.slice(0, 200);

export async function setOrderStatusAction(orderId: string, to: string): Promise<Result> {
  await assertAdmin();
  if (!isUuid(orderId) || !isOrderStatus(to)) return fail("Invalid request.");

  const admin = createAdminClient();
  const { data: order } = await admin
    .from("orders")
    .select("status")
    .eq("id", orderId)
    .maybeSingle();
  if (!order) return fail("Order not found.");

  const from = order.status as string;
  if (!isOrderStatus(from) || !NEXT_STATUSES[from].includes(to)) {
    return fail(`An order cannot move from "${from}" to "${to}".`);
  }

  const { error } = await admin.rpc("set_order_status", {
    p_order_id: orderId,
    p_status: to,
    p_payment_status: PAYMENT_STATUS_FOR[to] ?? null,
  });
  if (error) return fail(short(error.message));

  return { ok: true };
}

export async function setTrackingAction(
  orderId: string,
  carrier: string,
  trackingNumber: string,
): Promise<Result> {
  await assertAdmin();
  if (!isUuid(orderId)) return fail("Invalid request.");

  const c = carrier.trim().slice(0, 40);
  const n = trackingNumber.trim().slice(0, 40);

  const { error } = await createAdminClient()
    .from("orders")
    .update({ tracking_carrier: c || null, tracking_number: n || null })
    .eq("id", orderId);
  if (error) return fail(short(error.message));

  return { ok: true };
}