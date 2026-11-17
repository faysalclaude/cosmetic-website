import Image from "next/image";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { formatDateLocale } from "@/lib/format";
import { loc } from "@/lib/utils";
import type { BlogPost } from "@/types";

export default function BlogCard({ post }: { post: BlogPost }) {
  const locale = useLocale();
  const title = loc(post.title, locale);
  const category = loc(post.category, locale);

  return (
    <Link href={`/blog/${post.slug}`} className="group block">
      <div className="relative aspect-[3/2] overflow-hidden rounded-2xl bg-gradient-to-br from-brand-soft to-cream">
        {post.coverUrl && (
          <Image
            src={post.coverUrl}
            alt=""
            fill
            sizes="(min-width: 768px) 33vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
      </div>
      {category && <p className="mt-4 text-xs font-semibold text-brand">{category}</p>}
      <h3 className="mt-1 text-lg font-semibold group-hover:text-brand">{title}</h3>
      <p className="mt-1 line-clamp-2 text-sm text-muted">{loc(post.excerpt, locale)}</p>
      {post.publishedAt && (
        <p className="mt-2 text-xs text-muted">{formatDateLocale(post.publishedAt, locale)}</p>
      )}
    </Link>
  );
}