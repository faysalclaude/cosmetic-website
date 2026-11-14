import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { Link, redirect } from "@/i18n/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { getMyOrder } from "@/lib/data/orders";
import { siteConfig } from "@/lib/site";
import { formatDateTimeLocale } from "@/lib/format";
import { formatKRW } from "@/lib/utils";
import StatusBadge from "@/components/orders/StatusBadge";
import ProductVisual from "@/components/product/ProductVisual";
import PayNowButton from "@/components/orders/PayNowButton";

export const metadata: Metadata = {
  title: "Order",
  robots: { index: false, follow: false },
};

type Props = {
  params: Promise<{ orderNo: string }>;
    searchParams: Promise<{ placed?: string; payment?: string }>;
};

const STEPS = ["paid", "preparing", "shipped", "delivered"] as const;

export default async function OrderPage({ params, searchParams }: Props) {
  const { orderNo } = await params;
  const { placed, payment } = await searchParams;
  const locale = await getLocale();
  const t = await getTranslations("Order");

  const profile = await getCurrentProfile();
  if (!profile) {
    return redirect({ href: `/login?next=/orders/${orderNo}`, locale });
  }
  if (!/^BM\d{6}-\d{5}$/.test(orderNo)) notFound();

  const order = await getMyOrder(orderNo);
  if (!order) notFound();

  const lang = locale === "en" ? "en" : "ko";
  const closed = order.status === "cancelled" || order.status === "refunded";
  const stepIndex = STEPS.indexOf(order.status as (typeof STEPS)[number]);
  const showBank = order.payment_method === "bank_transfer" && order.status === "awaiting_deposit";
  const needsPayment = order.status === "pending" && order.payment_method !== "bank_transfer";
  const firstName = order.order_items[0]
    ? (lang === "en" ? order.order_items[0].name_en : order.order_items[0].name_ko)
    : "";
  const orderName =
    order.order_items.length > 1 ? `${firstName} +${order.order_items.length - 1}` : firstName;

  return (
    <div className="container-page py-12">
      {placed && (
        <div className="mb-8 rounded-3xl bg-brand-soft p-8 text-center">
          <h1 className="text-2xl font-bold text-brand-dark">{t("placedTitle")}</h1>
          <p className="mt-2 text-sm text-muted">{t("placedText")}</p>
        </div>
      )}

      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          {!placed && <h1 className="text-2xl font-bold">{t("title")}</h1>}
          <p className="mt-1 text-sm text-muted">
            {t("orderNo")}: <span className="font-semibold text-ink">{order.order_no}</span> ·{" "}
            {formatDateTimeLocale(order.created_at, locale)}
          </p>
        </div>
        <StatusBadge status={order.status} label={t(`status.${order.status}`)} />
      </div>

      {!closed && (
        <ol className="mb-8 grid grid-cols-4 gap-2 text-center text-xs font-medium">
          {STEPS.map((s, i) => (
            <li key={s}>
              <div className={`mb-2 h-1.5 rounded-full ${i <= stepIndex ? "bg-brand" : "bg-line"}`} />
              <span className={i <= stepIndex ? "text-ink" : "text-muted"}>{t(`status.${s}`)}</span>
            </li>
          ))}
        </ol>
      )}
      
      {needsPayment && (
        <section className="mb-8 rounded-3xl border-2 border-brand bg-white p-6 text-center md:p-8">
          <p className="text-sm text-muted">
            {payment === "failed" ? t("paymentFailed") : t("payPending")}
          </p>
          <PayNowButton
            orderNo={order.order_no}
            total={order.total}
            method={order.payment_method}
            orderName={orderName}
            recipient={order.recipient_name}
            phone={order.phone}
            email={profile.email ?? undefined}
          />
        </section>
      )}
      
      {showBank && (
        <section className="mb-8 rounded-3xl border-2 border-brand bg-white p-6 md:p-8">
          <h2 className="mb-4 text-lg font-semibold">{t("bankInfo")}</h2>
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted">{t("bankName")}</dt>
              <dd className="font-semibold">{siteConfig.bank.name}</dd>
            </div>
            <div>
              <dt className="text-muted">{t("account")}</dt>
              <dd className="font-semibold">{siteConfig.bank.account}</dd>
            </div>
            <div>
              <dt className="text-muted">{t("holder")}</dt>
              <dd className="font-semibold">{siteConfig.bank.holder}</dd>
            </div>
            <div>
              <dt className="text-muted">{t("amountToPay")}</dt>
              <dd className="text-lg font-bold text-brand">{formatKRW(order.total, locale)}</dd>
            </div>
            <div>
              <dt className="text-muted">{t("depositor")}</dt>
              <dd className="font-semibold">{order.depositor_name}</dd>
            </div>
          </dl>
          <p className="mt-4 text-xs text-muted">{t("depositNote")}</p>
        </section>
      )}

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <section className="rounded-3xl border border-line bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold">{t("items")}</h2>
          <ul className="divide-y divide-line">
            {order.order_items.map((i) => (
              <li key={i.id} className="flex items-center gap-4 py-4">
                <ProductVisual
                  tint="#fcf0f4"
                  accent="#e81c68"
                  label={lang === "en" ? i.name_en : i.name_ko}
                  src={i.image_url ?? undefined}
                  className="h-16 w-16 shrink-0 rounded-xl"
                />
                <div className="min-w-0 flex-1 text-sm">
                  <p className="font-medium">{lang === "en" ? i.name_en : i.name_ko}</p>
                  <p className="mt-1 text-muted">
                    {formatKRW(i.unit_price, locale)} × {i.quantity}
                  </p>
                </div>
                <span className="text-sm font-semibold">
                  {formatKRW(i.unit_price * i.quantity, locale)}
                </span>
              </li>
            ))}
          </ul>

          <dl className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">{t("subtotal")}</dt>
              <dd>{formatKRW(order.subtotal, locale)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">{t("shipping")}</dt>
              <dd>{order.shipping_fee === 0 ? t("free") : formatKRW(order.shipping_fee, locale)}</dd>
            </div>
            <div className="flex justify-between text-base font-bold">
              <dt>{t("total")}</dt>
              <dd className="text-brand">{formatKRW(order.total, locale)}</dd>
            </div>
          </dl>
        </section>

        <div className="space-y-6">
          <section className="rounded-3xl border border-line bg-white p-6 text-sm">
            <h2 className="mb-3 text-lg font-semibold">{t("shippingTo")}</h2>
            <p className="font-medium">{order.recipient_name}</p>
            <p className="text-muted">{order.phone}</p>
            <p className="mt-2 text-muted">
              ({order.postcode}) {order.address1} {order.address2}
            </p>
            {order.memo && <p className="mt-2 text-muted">{order.memo}</p>}
            {order.tracking_number && (
              <p className="mt-4 rounded-xl bg-cream p-3">
                {t("carrier")}: {order.tracking_carrier} · {t("trackingNo")}: {order.tracking_number}
              </p>
            )}
          </section>

          <section className="rounded-3xl border border-line bg-white p-6 text-sm">
            <h2 className="mb-3 text-lg font-semibold">{t("payment")}</h2>
            <p>{t(`method.${order.payment_method}`)}</p>
            <p className="mt-1 text-muted">{t(`paymentStatus.${order.payment_status}`)}</p>
          </section>

          <Link href="/my-page" className="block text-center text-sm text-muted underline">
            {t("backToMyPage")}
          </Link>
        </div>
      </div>
    </div>
  );
}