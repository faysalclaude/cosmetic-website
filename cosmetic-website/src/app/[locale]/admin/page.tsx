import { Link } from "@/i18n/navigation";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function AdminDashboardPage() {
  await requireAdmin("/admin");
  const admin = createAdminClient();
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const head = { count: "exact" as const, head: true };

  const [users, products, orders24, awaiting, unpaid, unread, okLogins, failedLogins] =
    await Promise.all([
      admin.from("profiles").select("*", head),
      admin.from("products").select("*", head),
      admin.from("orders").select("*", head).gte("created_at", since),
      admin.from("orders").select("*", head).eq("status", "awaiting_deposit"),
      admin.from("orders").select("*", head).eq("status", "pending"),
      admin.from("contact_messages").select("*", head).eq("is_read", false),
      admin.from("login_logs").select("*", head).eq("success", true).gte("created_at", since),
      admin.from("login_logs").select("*", head).eq("success", false).gte("created_at", since),
    ]);

  const cards = [
    { label: "New orders (24h)", value: orders24.count ?? 0, href: "/admin/orders" },
    {
      label: "Awaiting bank deposit",
      value: awaiting.count ?? 0,
      href: "/admin/orders?status=awaiting_deposit",
      alert: (awaiting.count ?? 0) > 0,
    },
    {
      label: "Unpaid online orders",
      value: unpaid.count ?? 0,
      href: "/admin/orders?status=pending",
      alert: (unpaid.count ?? 0) > 0,
    },
    {
      label: "Unread messages",
      value: unread.count ?? 0,
      href: "/admin/messages",
      alert: (unread.count ?? 0) > 0,
    },
    { label: "Products", value: products.count ?? 0, href: "/admin/products" },
    { label: "Registered users", value: users.count ?? 0, href: "/admin/users" },
    { label: "Successful logins (24h)", value: okLogins.count ?? 0, href: "/admin/login-logs" },
    { label: "Failed logins (24h)", value: failedLogins.count ?? 0, href: "/admin/login-logs" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className={`rounded-2xl border bg-white p-6 transition-colors hover:border-brand ${
              c.alert ? "border-brand" : "border-line"
            }`}
          >
            <p className="text-sm text-muted">{c.label}</p>
            <p className={`mt-2 text-3xl font-bold ${c.alert ? "text-brand" : ""}`}>{c.value}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}