import { Link } from "@/i18n/navigation";
import { requireAdmin } from "@/lib/auth";
import { getAdminOrders } from "@/lib/data/orders";
import { formatDateTime } from "@/lib/format";
import { formatKRW } from "@/lib/utils";
import {
  METHOD_LABEL,
  ORDER_STATUSES,
  STATUS_LABEL,
  isOrderStatus,
} from "@/lib/orders";
import StatusBadge from "@/components/orders/StatusBadge";

type Props = { searchParams: Promise<{ status?: string }> };

export default async function AdminOrdersPage({ searchParams }: Props) {
  await requireAdmin("/admin/orders");
  const { status } = await searchParams;
  const filter = status && isOrderStatus(status) ? status : undefined;
  const orders = await getAdminOrders(filter);

  const tab = (active: boolean) =>
    `rounded-full px-4 py-2 text-sm font-medium ${
      active ? "bg-brand text-white" : "border border-line bg-white hover:border-brand"
    }`;

  return (
    <div>
      <h1 className="text-2xl font-bold">Orders</h1>
      <p className="mt-1 text-sm text-muted">{orders.length} orders</p>

      <div className="mt-5 flex flex-wrap gap-2">
        <Link href="/admin/orders" className={tab(!filter)}>
          All
        </Link>
        {ORDER_STATUSES.map((s) => (
          <Link key={s} href={`/admin/orders?status=${s}`} className={tab(filter === s)}>
            {STATUS_LABEL[s]}
          </Link>
        ))}
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-line bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-cream text-xs text-muted uppercase">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Date (KST)</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {orders.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-muted">
                  No orders yet.
                </td>
              </tr>
            )}
            {orders.map((o) => (
              <tr key={o.id}>
                <td className="px-4 py-3 font-semibold whitespace-nowrap">{o.order_no}</td>
                <td className="px-4 py-3 whitespace-nowrap">{formatDateTime(o.created_at)}</td>
                <td className="px-4 py-3">
                  <p className="font-medium">{o.recipient_name}</p>
                  <p className="text-xs text-muted">{o.customerEmail}</p>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">{formatKRW(o.total, "ko")}</td>
                <td className="px-4 py-3">
                  <p>{METHOD_LABEL[o.payment_method] ?? o.payment_method}</p>
                  <p className="text-xs text-muted">{o.payment_status}</p>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge
                    status={o.status}
                    label={isOrderStatus(o.status) ? STATUS_LABEL[o.status] : o.status}
                  />
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/orders/${o.id}`} className="font-semibold text-brand hover:underline">
                    Open
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}