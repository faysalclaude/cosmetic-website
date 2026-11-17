import { Link } from "@/i18n/navigation";
import { requireAdmin } from "@/lib/auth";
import { getAdminPosts } from "@/lib/data/admin-blog";
import { formatDateTime } from "@/lib/format";
import BlogRowActions from "@/components/admin/BlogRowActions";

export default async function AdminBlogPage() {
  await requireAdmin("/admin/blog");
  const posts = await getAdminPosts();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Blog</h1>
          <p className="mt-1 text-sm text-muted">{posts.length} posts</p>
        </div>
        <Link
          href="/admin/blog/new"
          className="rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          + New post
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-line bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-cream text-xs text-muted uppercase">
            <tr>
              <th className="px-4 py-3">Post</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Published (KST)</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {posts.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-muted">
                  No posts yet.
                </td>
              </tr>
            )}
            {posts.map((p) => (
              <tr key={p.id} className={p.is_published ? "" : "bg-cream/60"}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {p.cover_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.cover_url} alt="" className="h-12 w-16 rounded-lg object-cover" />
                    ) : (
                      <span className="h-12 w-16 shrink-0 rounded-lg bg-cream" />
                    )}
                    <div className="min-w-0">
                      <p className="font-medium">{p.title_en}</p>
                      <p className="text-xs text-muted">{p.title_ko}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">{p.category_en || "-"}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      p.is_published ? "bg-green-100 text-green-800" : "bg-cream text-muted"
                    }`}
                  >
                    {p.is_published ? "Published" : "Draft"}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {p.published_at ? formatDateTime(p.published_at) : "-"}
                </td>
                <td className="px-4 py-3">
                  <BlogRowActions id={p.id} isPublished={p.is_published} title={p.title_en} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}