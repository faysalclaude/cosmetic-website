import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getPublishedPosts } from "@/lib/data/blog";
import BlogCard from "@/components/blog/BlogCard";

export const revalidate = 60;

type Params = Promise<{ locale: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Blog" });
  return {
    title: t("title"),
    description: t("subtitle"),
    alternates: {
      canonical: locale === "en" ? "/en/blog" : "/blog",
      languages: { ko: "/blog", en: "/en/blog" },
    },
    openGraph: {
      title: t("title"),
      description: t("subtitle"),
      type: "website",
      locale: locale === "en" ? "en_US" : "ko_KR",
    },
  };
}

export default async function BlogPage() {
  const t = await getTranslations("Blog");
  const posts = await getPublishedPosts();

  return (
    <div className="container-page py-12">
      <nav className="mb-6 flex items-center gap-2 text-sm text-muted">
        <Link href="/" className="hover:text-brand">
          {t("home")}
        </Link>
        <span>/</span>
        <span className="text-ink">{t("title")}</span>
      </nav>

      <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{t("title")}</h1>
      <p className="mt-2 max-w-2xl text-muted">{t("subtitle")}</p>

      {posts.length === 0 ? (
        <p className="mt-16 rounded-3xl bg-cream py-20 text-center text-muted">{t("empty")}</p>
      ) : (
        <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}