import { requireAdmin } from "@/lib/auth";
import BlogForm from "@/components/admin/BlogFrom";

export default async function NewPostPage() {
  await requireAdmin("/admin/blog/new");

  return (
    <div className="max-w-4xl">
      <h1 className="mb-6 text-2xl font-bold">New post</h1>
      <BlogForm />
    </div>
  );
}