import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatDateTime } from "@/lib/format";

export default async function AdminLoginLogsPage() {
  await requireAdmin("/admin/login-logs");

  const { data, error } = await createAdminClient()
    .from("login_logs")
    .select("id, email, success, reason, ip_address, user_agent, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) throw new Error(error.message.slice(0, 200));

  return (
    <div>
      <h1 className="text-2xl font-bold">Login logs</h1>
      <p className="mt-1 text-sm text-muted">Latest 100 attempts</p>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-line bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-cream text-xs text-muted uppercase">
            <tr>
              <th className="px-4 py-3">Time (KST)</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Result</th>
              <th className="px-4 py-3">IP address</th>
              <th className="px-4 py-3">Device</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {(data ?? []).map((l) => (
              <tr key={l.id}>
                <td className="px-4 py-3 whitespace-nowrap">{formatDateTime(l.created_at)}</td>
                <td className="px-4 py-3">{l.email}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      l.success ? "bg-green-100 text-green-800" : "bg-brand-soft text-brand-dark"
                    }`}
                  >
                    {l.success ? "Success" : "Failed"}
                  </span>
                  {l.reason && <span className="ml-2 text-xs text-muted">{l.reason}</span>}
                </td>
                <td className="px-4 py-3">{l.ip_address || "-"}</td>
                <td className="max-w-xs truncate px-4 py-3 text-xs text-muted" title={l.user_agent ?? ""}>
                  {l.user_agent || "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}