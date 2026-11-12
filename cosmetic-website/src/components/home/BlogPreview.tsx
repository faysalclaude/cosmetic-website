import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { blogPosts } from "@/lib/products";
import { loc } from "@/lib/utils";

export default function BlogPreview() {
  const t = useTranslations("Home");
  const locale = useLocale();

  return (
    <section className="container-page py-16">
      <div className="mb-10 flex items-end justify-between">
        <h2 className="text-2xl font-bold md:text-3xl">{t("blogTitle")}</h2>
        <Link href="/blog" className="text-sm text-brand underline">
          {t("viewAll")}
        </Link>
      </div>
      <div className="grid gap-8 md:grid-cols-3">
        {blogPosts.map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`} className="group">
            <div
              className="aspect-[4/3] rounded-2xl transition-transform duration-300 group-hover:scale-[1.02]"
              style={{
                background: `linear-gradient(135deg, ${post.tint}, #ffffff)`,
              }}
            />
            <p className="mt-4 text-xs font-medium text-brand">
              {loc(post.category, locale)}
            </p>
            <h3 className="mt-1 font-semibold group-hover:text-brand">
              {loc(post.title, locale)}
            </h3>
            <p className="mt-1 text-sm text-muted">{loc(post.excerpt, locale)}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}