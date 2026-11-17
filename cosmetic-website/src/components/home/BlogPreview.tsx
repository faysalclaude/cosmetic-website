import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { BlogPost } from "@/types";
import BlogCard from "@/components/blog/BlogCard";

export default function BlogPreview({ posts }: { posts: BlogPost[] }) {
  const t = useTranslations("Home");
  if (posts.length === 0) return null;

  return (
    <section className="container-page py-16">
      <div className="mb-10 flex items-end justify-between">
        <h2 className="text-2xl font-bold md:text-3xl">{t("blogTitle")}</h2>
        <Link href="/blog" className="text-sm text-brand underline">
          {t("viewAll")}
        </Link>
      </div>
      <div className="grid gap-8 md:grid-cols-3">
        {posts.map((post) => (
          <BlogCard key={post.slug} post={post} />
        ))}
      </div>
    </section>
  );
}