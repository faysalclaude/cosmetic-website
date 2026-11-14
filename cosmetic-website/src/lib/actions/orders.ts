"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkoutSchema } from "@/lib/validation/checkout";
import { siteConfig } from "@/lib/site";

export type PlaceOrderResult =
  | { ok: true; orderNo: string }
  | { ok: false; error: string; detail?: string };

export async function placeOrderAction(input: unknown): Promise<PlaceOrderResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "notLoggedIn" };

  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "generic" };
  }
  const d = parsed.data;

  // merge duplicate products; prices are NOT taken from the browser
  const merged = new Map<string, number>();
  for (const i of d.items) {
    merged.set(i.productId, Math.min(99, (merged.get(i.productId) ?? 0) + i.qty));
  }
  const items = [...merged].map(([product_id, qty]) => ({ product_id, qty }));

  const { data, error } = await createAdminClient().rpc("place_order", {
    p_user_id: user.id,
    p_method: d.method,
    p_recipient: d.recipient,
    p_phone: d.phone,
    p_postcode: d.postcode,
    p_address1: d.address1,
    p_address2: d.address2,
    p_memo: d.memo,
    p_depositor: d.depositor || d.recipient,
    p_items: items,
    p_fee: siteConfig.shipping.fee,
    p_free_over: siteConfig.shipping.freeOver,
  });

  if (error) {
    const message = error.message;
    if (message.includes("OUT_OF_STOCK:")) {
      return {
        ok: false,
        error: "outOfStock",
        detail: message.split("OUT_OF_STOCK:")[1]?.trim(),
      };
    }
    if (message.includes("PRODUCT_UNAVAILABLE")) return { ok: false, error: "productUnavailable" };
    if (message.includes("EMPTY_CART") || message.includes("BAD_QTY")) {
      return { ok: false, error: "cartEmpty" };
    }
    console.error("place_order failed", message);
    return { ok: false, error: "generic" };
  }

  const result = data as { order_no?: string } | null;
  if (!result?.order_no) return { ok: false, error: "generic" };
  return { ok: true, orderNo: result.order_no };
}