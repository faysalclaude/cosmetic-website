import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { Link, redirect } from "@/i18n/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { getMyOrders } from "@/lib/data/orders";
import { formatDateTimeLocale } from "@/lib/format";
import { formatKRW } from "@/lib/utils";
import ProfileForm from "@/components/auth/ProfileForm";
import LogoutButton from "@/components/auth/LogoutButton";
import StatusBadge from "@/components/orders/StatusBadge";

export const metadata: Metadata = {
  title: "My Page",
  robots: { index: false, follow: false },
};

export default async function MyPage() {
  const t = await getTranslations("MyPage");
  const to = await getTranslations("Order");
  const locale = await getLocale();
  const profile = await getCurrentProfile();

  if (!profile) {
    return redirect({ href: "/login?next=/my-page", locale });
  }

  const orders = await getMyOrders();
  const lang = locale === "en" ? "en" : "ko";

  return (
    <div className="container-page py-12">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <div className="flex items-center gap-3">
          {profile.role === "admin" && (
            <Link
              href="/admin"
              className="rounded-full border border-ink px-5 py-2 text-sm font-medium hover:bg-ink hover:text-white"
            >
              {t("adminLink")}
            </Link>
          )}
          <LogoutButton className="rounded-full border border-line px-5 py-2 text-sm font-medium hover:border-brand hover:text-brand" />
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <section className="rounded-3xl border border-line bg-white p-8">
          <h2 className="mb-6 text-lg font-semibold">{t("profile")}</h2>
          <ProfileForm
            email={profile.email ?? ""}
            fullName={profile.full_name ?? ""}
            phone={profile.phone ?? ""}
          />
        </section>

        <section className="rounded-3xl border border-line bg-white p-8">
          <h2 className="mb-6 text-lg font-semibold">{t("orders")}</h2>
          {orders.length === 0 ? (
            <p className="text-sm text-muted">{t("noOrders")}</p>
          ) : (
            <ul className="space-y-3">
              {orders.map((o) => {
                const first = o.order_items[0];
                const firstName = first ? (lang === "en" ? first.name_en : first.name_ko) : "";
                const more = o.order_items.length - 1;
                return (
                  <li key={o.id}>
                    <Link
                      href={`/orders/${o.order_no}`}
                      className="block rounded-2xl border border-line p-4 transition-colors hover:border-brand"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-semibold">{o.order_no}</span>
                        <StatusBadge status={o.status} label={to(`status.${o.status}`)} />
                      </div>
                      <p className="mt-2 line-clamp-1 text-sm text-muted">
                        {firstName}
                        {more > 0 ? ` +${more}` : ""}
                      </p>
                      <div className="mt-2 flex items-center justify-between text-xs text-muted">
                        <span>{formatDateTimeLocale(o.created_at, locale)}</span>
                        <span className="text-sm font-semibold text-ink">
                          {formatKRW(o.total, locale)}
                        </span>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}