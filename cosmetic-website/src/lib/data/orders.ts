import "server-only";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type OrderItemRow = {
  id: string;
  product_id: string | null;
  name_ko: string;
  name_en: string;
  image_url: string | null;
  unit_price: number;
  quantity: number;
};

export type OrderRow = {
  id: string;
  order_no: string;
  user_id: string | null;
  status: string;
  payment_method: string;
  payment_status: string;
  subtotal: number;
  shipping_fee: number;
  total: number;
  recipient_name: string;
  phone: string;
  postcode: string;
  address1: string;
  address2: string | null;
  memo: string | null;
  depositor_name: string | null;
  tracking_carrier: string | null;
  tracking_number: string | null;
  created_at: string;
  order_items: OrderItemRow[];
};

export type OrderListRow = {
  id: string;
  order_no: string;
  status: string;
  total: number;
  created_at: string;
  order_items: { name_ko: string; name_en: string; quantity: number }[];
};

// ----- customer (uses the logged-in session, so Row Level Security applies) -----

export async function getMyOrders(): Promise<OrderListRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("id, order_no, status, total, created_at, order_items(name_ko, name_en, quantity)")
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) throw new Error(error.message.slice(0, 200));
  return (data ?? []) as unknown as OrderListRow[];
}

export async function getMyOrder(orderNo: string): Promise<OrderRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("order_no", orderNo)
    .maybeSingle();

  if (error) throw new Error(error.message.slice(0, 200));
  return (data as unknown as OrderRow | null) ?? null;
}

// ----- admin (secret-key client; call only after requireAdmin) -----

export type AdminOrderListRow = {
  id: string;
  order_no: string;
  status: string;
  payment_method: string;
  payment_status: string;
  total: number;
  created_at: string;
  recipient_name: string;
  user_id: string | null;
  customerEmail: string;
};

export async function getAdminOrders(status?: string): Promise<AdminOrderListRow[]> {
  const admin = createAdminClient();
  let query = admin
    .from("orders")
    .select(
      "id, order_no, status, payment_method, payment_status, total, created_at, recipient_name, user_id",
    )
    .order("created_at", { ascending: false })
    .limit(200);
  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error) throw new Error(error.message.slice(0, 200));
  const rows = (data ?? []) as Omit<AdminOrderListRow, "customerEmail">[];

  const ids = [...new Set(rows.map((r) => r.user_id).filter((v): v is string => Boolean(v)))];
  const emails = new Map<string, string>();
  if (ids.length) {
    const { data: profiles } = await admin.from("profiles").select("id, email").in("id", ids);
    for (const p of profiles ?? []) emails.set(p.id as string, (p.email as string) ?? "");
  }

  return rows.map((r) => ({
    ...r,
    customerEmail: r.user_id ? (emails.get(r.user_id) ?? "") : "",
  }));
}

export type AdminCustomer = { email: string | null; full_name: string | null; phone: string | null };

export async function getAdminOrder(
  id: string,
): Promise<{ order: OrderRow; customer: AdminCustomer | null } | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message.slice(0, 200));
  if (!data) return null;
  const order = data as unknown as OrderRow;

  let customer: AdminCustomer | null = null;
  if (order.user_id) {
    const { data: profile } = await admin
      .from("profiles")
      .select("email, full_name, phone")
      .eq("id", order.user_id)
      .maybeSingle();
    customer = (profile as AdminCustomer | null) ?? null;
  }
  return { order, customer };
}