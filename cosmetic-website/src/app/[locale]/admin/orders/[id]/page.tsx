import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { requireAdmin } from "@/lib/auth";
import { getAdminOrder } from "@/lib/data/orders";
import { formatDateTime } from "@/lib/format";
import { formatKRW } from "@/lib/utils";
import {
  METHOD_LABEL,
  NEXT_STATUSES,
  STATUS_LABEL,
  isOrderStatus,
} from "@/lib/orders";
import StatusBadge from "@/components/orders/StatusBadge";
import AdminOrderActions from "@/components/admin/AdminOrderActions";

type Params = Promise<{ id: string }>;

export default async function AdminOrderPage({ params }: { params: Params }) {
  const { id } = await params;
  await requireAdmin(`/admin/orders/${id}`);
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const found = await getAdminOrder(id);
  if (!found) notFound();
  const { order, customer } = found;
  if (!isOrderStatus(order.status)) notFound();

  return (
    <div className="max-w-6xl">
      <Link href="/admin/orders" className="text-sm text-muted underline">
        ← Back to orders
      </Link>

      <div className="mt-3 mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{order.order_no}</h1>
          <p className="mt-1 text-sm text-muted">{formatDateTime(order.created_at)} (KST)</p>
        </div>
        <StatusBadge status={order.status} label={STATUS_LABEL[order.status]} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <section className="rounded-2xl border border-line bg-white p-6">
          <h2 className="mb-4 text-base font-semibold">Items</h2>
          <ul className="divide-y divide-line">
            {order.order_items.map((i) => (
              <li key={i.id} className="flex items-center gap-4 py-3">
                {i.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={i.image_url} alt="" className="h-14 w-14 rounded-lg bg-cream object-contain" />
                ) : (
                  <span className="h-14 w-14 rounded-lg bg-cream" />
                )}
                <div className="min-w-0 flex-1 text-sm">
                  <p className="font-medium">{i.name_en}</p>
                  <p className="text-xs text-muted">{i.name_ko}</p>
                  <p className="mt-1 text-muted">
                    {formatKRW(i.unit_price, "ko")} × {i.quantity}
                  </p>
                </div>
                <span className="text-sm font-semibold">
                  {formatKRW(i.unit_price * i.quantity, "ko")}
                </span>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Subtotal</dt>
              <dd>{formatKRW(order.subtotal, "ko")}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Shipping</dt>
              <dd>{formatKRW(order.shipping_fee, "ko")}</dd>
            </div>
            <div className="flex justify-between text-base font-bold">
              <dt>Total</dt>
              <dd className="text-brand">{formatKRW(order.total, "ko")}</dd>
            </div>
          </dl>
        </section>

        <div className="space-y-6">
          <section className="rounded-2xl border border-line bg-white p-6">
            <h2 className="mb-4 text-base font-semibold">Update the order</h2>
            <AdminOrderActions
              orderId={order.id}
              status={order.status}
              next={NEXT_STATUSES[order.status]}
              carrier={order.tracking_carrier ?? ""}
              trackingNo={order.tracking_number ?? ""}
            />
          </section>

          <section className="rounded-2xl border border-line bg-white p-6 text-sm">
            <h2 className="mb-3 text-base font-semibold">Payment</h2>
            <p>{METHOD_LABEL[order.payment_method] ?? order.payment_method}</p>
            <p className="mt-1 text-muted">Payment status: {order.payment_status}</p>
            {order.payment_method === "bank_transfer" && (
              <p className="mt-1 text-muted">Depositor name: {order.depositor_name || "-"}</p>
            )}
          </section>

          <section className="rounded-2xl border border-line bg-white p-6 text-sm">
            <h2 className="mb-3 text-base font-semibold">Customer</h2>
            <p className="font-medium">{customer?.full_name || order.recipient_name}</p>
            <p className="text-muted">{customer?.email || "-"}</p>
          </section>

          <section className="rounded-2xl border border-line bg-white p-6 text-sm">
            <h2 className="mb-3 text-base font-semibold">Shipping address</h2>
            <p className="font-medium">{order.recipient_name}</p>
            <p className="text-muted">{order.phone}</p>
            <p className="mt-2 text-muted">
              ({order.postcode}) {order.address1} {order.address2}
            </p>
            {order.memo && <p className="mt-2 rounded-xl bg-cream p-3">Request: {order.memo}</p>}
          </section>
        </div>
      </div>
    </div>
  );
}