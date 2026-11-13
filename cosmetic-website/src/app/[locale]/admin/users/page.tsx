import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatDateTime } from "@/lib/format";

export default async function AdminUsersPage() {
  await requireAdmin("/admin/users");

  const { data, error } = await createAdminClient()
    .from("profiles")
    .select("id, email, full_name, phone, role, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) throw new Error(error.message.slice(0, 200));

  return (
    <div>
      <h1 className="text-2xl font-bold">Users</h1>
      <p className="mt-1 text-sm text-muted">{data?.length ?? 0} registered users</p>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-line bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-cream text-xs text-muted uppercase">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Joined (KST)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {(data ?? []).map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-3 font-medium">{u.full_name || "-"}</td>
                <td className="px-4 py-3">{u.email}</td>
                <td className="px-4 py-3">{u.phone || "-"}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      u.role === "admin" ? "bg-brand text-white" : "bg-cream"
                    }`}
                  >
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">{formatDateTime(u.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}