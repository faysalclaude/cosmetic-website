import { Link } from "@/i18n/navigation";
import { requireAdmin } from "@/lib/auth";
import { getAdminSitePages } from "@/lib/data/admin-content";
import { formatDateTime } from "@/lib/format";

export default async function AdminPagesPage() {
  await requireAdmin("/admin/pages");
  const pages = await getAdminSitePages();

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold">Pages</h1>
      <p className="mt-1 mb-6 text-sm text-muted">
        Terms, Privacy, Refund, FAQ and Shop by Country. Edit the text in Korean and English.
      </p>

      <div className="overflow-x-auto rounded-2xl border border-line bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-cream text-xs text-muted uppercase">
            <tr>
              <th className="px-4 py-3">Page</th>
              <th className="px-4 py-3">Address</th>
              <th className="px-4 py-3">Last edited (KST)</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {pages.map((p) => (
              <tr key={p.slug}>
                <td className="px-4 py-3">
                  <p className="font-medium">{p.title_en}</p>
                  <p className="text-xs text-muted">{p.title_ko}</p>
                </td>
                <td className="px-4 py-3 text-muted">/{p.slug}</td>
                <td className="px-4 py-3 whitespace-nowrap">{formatDateTime(p.updated_at)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-4">
                    <Link href={`/${p.slug}`} target="_blank" className="text-muted hover:text-ink">
                      View
                    </Link>
                    <Link href={`/admin/pages/${p.slug}`} className="font-semibold text-brand hover:underline">
                      Edit
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}