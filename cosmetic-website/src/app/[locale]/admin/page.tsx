import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function AdminDashboardPage() {
  await requireAdmin("/admin");
  const admin = createAdminClient();
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const [users, products, okLogins, failedLogins] = await Promise.all([
    admin.from("profiles").select("*", { count: "exact", head: true }),
    admin.from("products").select("*", { count: "exact", head: true }),
    admin
      .from("login_logs")
      .select("*", { count: "exact", head: true })
      .eq("success", true)
      .gte("created_at", since),
    admin
      .from("login_logs")
      .select("*", { count: "exact", head: true })
      .eq("success", false)
      .gte("created_at", since),
  ]);

  const cards = [
    { label: "Registered users", value: users.count ?? 0 },
    { label: "Products", value: products.count ?? 0 },
    { label: "Successful logins (24h)", value: okLogins.count ?? 0 },
    { label: "Failed logins (24h)", value: failedLogins.count ?? 0 },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl border border-line bg-white p-6">
            <p className="text-sm text-muted">{c.label}</p>
            <p className="mt-2 text-3xl font-bold text-brand">{c.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}