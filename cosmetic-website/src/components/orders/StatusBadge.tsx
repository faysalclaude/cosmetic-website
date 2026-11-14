import { STATUS_STYLE, type OrderStatus } from "@/lib/orders";

export default function StatusBadge({ status, label }: { status: string; label: string }) {
  const style = STATUS_STYLE[status as OrderStatus] ?? "bg-cream text-muted";
  return (
    <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${style}`}>
      {label}
    </span>
  );
}