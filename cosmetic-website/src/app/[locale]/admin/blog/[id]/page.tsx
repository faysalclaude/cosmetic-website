import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { requireAdmin } from "@/lib/auth";
import { getAdminPost, toBlogFormValues } from "@/lib/data/admin-blog";
import BlogForm from "@/components/admin/BlogFrom";

type Params = Promise<{ id: string }>;

export default async function EditPostPage({ params }: { params: Params }) {
  const { id } = await params;
  await requireAdmin(`/admin/blog/${id}`);
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const post = await getAdminPost(id);
  if (!post) notFound();

  const initial = toBlogFormValues(post);

  return (
    <div className="max-w-4xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Edit: {post.title_en}</h1>
        {post.is_published ? (
          <Link href={`/blog/${post.slug}`} target="_blank" className="text-sm text-brand underline">
            View on website
          </Link>
        ) : (
          <span className="text-sm text-muted">Draft: not visible to customers</span>
        )}
      </div>
      {/* key: remounts the form with fresh values after every save */}
      <BlogForm key={JSON.stringify(initial)} id={post.id} initial={initial} />
    </div>
  );
}