export const ORDER_STATUSES = [
  "pending",
  "awaiting_deposit",
  "paid",
  "preparing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const isOrderStatus = (v: string): v is OrderStatus =>
  (ORDER_STATUSES as readonly string[]).includes(v);

// Allowed moves. Unpaid orders can be cancelled; paid orders are refunded instead.
export const NEXT_STATUSES: Record<OrderStatus, OrderStatus[]> = {
  pending: ["paid", "cancelled"],
  awaiting_deposit: ["paid", "cancelled"],
  paid: ["preparing", "refunded"],
  preparing: ["shipped", "refunded"],
  shipped: ["delivered", "refunded"],
  delivered: ["refunded"],
  cancelled: [],
  refunded: [],
};

export const PAYMENT_STATUS_FOR: Partial<Record<OrderStatus, "paid" | "refunded">> = {
  paid: "paid",
  refunded: "refunded",
};

export const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "Pending payment",
  awaiting_deposit: "Awaiting deposit",
  paid: "Paid",
  preparing: "Preparing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

export const ACTION_LABEL: Record<OrderStatus, string> = {
  pending: "Set pending",
  awaiting_deposit: "Set awaiting deposit",
  paid: "Confirm payment received",
  preparing: "Start preparing",
  shipped: "Mark as shipped",
  delivered: "Mark as delivered",
  cancelled: "Cancel order (restock)",
  refunded: "Mark as refunded (restock)",
};

export const STATUS_STYLE: Record<OrderStatus, string> = {
  pending: "bg-amber-100 text-amber-800",
  awaiting_deposit: "bg-amber-100 text-amber-800",
  paid: "bg-green-100 text-green-800",
  preparing: "bg-blue-100 text-blue-800",
  shipped: "bg-indigo-100 text-indigo-800",
  delivered: "bg-green-200 text-green-900",
  cancelled: "bg-cream text-muted",
  refunded: "bg-brand-soft text-brand-dark",
};

export const METHOD_LABEL: Record<string, string> = {
  bank_transfer: "Bank transfer",
  toss: "Toss Pay",
  kakao: "Kakao Pay",
  naver: "Naver Pay",
  card: "Card",
};