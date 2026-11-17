import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { getPostBySlug, getPublishedPosts } from "@/lib/data/blog";
import { formatDateLocale } from "@/lib/format";
import { siteConfig } from "@/lib/site";
import { loc } from "@/lib/utils";
import Markdown from "@/components/blog/Markdown";
import BlogCard from "@/components/blog/BlogCard";

export const revalidate = 60;

type Params = Promise<{ locale: string; slug: string }>;

export async function generateStaticParams() {
  const posts = await getPublishedPosts();
  return routing.locales.flatMap((locale) => posts.map((p) => ({ locale, slug: p.slug })));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};

  const title = loc(post.title, locale);
  const description = loc(post.excerpt, locale).slice(0, 160);
  const path = `/blog/${slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: locale === "en" ? `/en${path}` : path,
      languages: { ko: path, en: `/en${path}` },
    },
    openGraph: {
      title,
      description,
      type: "article",
      locale: locale === "en" ? "en_US" : "ko_KR",
      publishedTime: post.publishedAt ?? undefined,
      images: post.coverUrl ? [post.coverUrl] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: { params: Params }) {
  const { locale, slug } = await params;
  const t = await getTranslations("Blog");
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const others = (await getPublishedPosts()).filter((p) => p.slug !== slug).slice(0, 3);

  const title = loc(post.title, locale);
  const category = loc(post.category, locale);
  const body = loc(post.content, locale);

  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const url = `${base}${locale === "en" ? "/en" : ""}/blog/${slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description: loc(post.excerpt, locale),
    image: post.coverUrl ? [post.coverUrl] : undefined,
    datePublished: post.publishedAt ?? undefined,
    inLanguage: locale === "en" ? "en" : "ko",
    mainEntityOfPage: url,
    author: { "@type": "Organization", name: siteConfig.logoText },
    publisher: { "@type": "Organization", name: siteConfig.logoText },
  };

  return (
    <article className="container-page py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      <nav className="mb-8 flex flex-wrap items-center gap-2 text-sm text-muted">
        <Link href="/" className="hover:text-brand">
          {t("home")}
        </Link>
        <span>/</span>
        <Link href="/blog" className="hover:text-brand">
          {t("title")}
        </Link>
        <span>/</span>
        <span className="line-clamp-1 text-ink">{title}</span>
      </nav>

      <div className="mx-auto max-w-3xl">
        {category && <p className="text-sm font-semibold text-brand">{category}</p>}
        <h1 className="mt-2 text-3xl leading-tight font-bold tracking-tight md:text-4xl">{title}</h1>
        {post.publishedAt && (
          <p className="mt-3 text-sm text-muted">{formatDateLocale(post.publishedAt, locale)}</p>
        )}

        {post.coverUrl && (
          <div className="relative mt-8 aspect-[3/2] overflow-hidden rounded-3xl">
            <Image
              src={post.coverUrl}
              alt={title}
              fill
              priority
              sizes="(min-width: 768px) 768px, 100vw"
              className="object-cover"
            />
          </div>
        )}

        <div className="mt-10">
          <Markdown>{body}</Markdown>
        </div>

        <div className="mt-12 rounded-3xl bg-brand-soft p-8 text-center">
          <Link
            href="/product-list"
            className="inline-block rounded-full bg-brand px-8 py-3 text-sm font-semibold text-white hover:bg-brand-dark"
          >
            {t("shopCta")}
          </Link>
        </div>
      </div>

      {others.length > 0 && (
        <section className="mt-20">
          <h2 className="mb-8 text-2xl font-bold">{t("related")}</h2>
          <div className="grid gap-8 md:grid-cols-3">
            {others.map((p) => (
              <BlogCard key={p.slug} post={p} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}