import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getSitePage } from "@/lib/data/pages";
import { formatDateLocale } from "@/lib/format";
import { pageMetadata, stripMarkdown } from "@/lib/seo";
import { loc } from "@/lib/utils";
import Markdown from "@/components/blog/Markdown";

export async function SitePage({ slug }: { slug: string }) {
  const locale = await getLocale();
  const t = await getTranslations("Pages");
  const page = await getSitePage(slug);
  if (!page) notFound();

  const title = loc(page.title, locale);

  return (
    <div className="container-page py-12">
      <nav className="mb-8 flex items-center gap-2 text-sm text-muted">
        <Link href="/" className="hover:text-brand">
          {t("home")}
        </Link>
        <span>/</span>
        <span className="text-ink">{title}</span>
      </nav>

      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{title}</h1>
        <p className="mt-2 text-sm text-muted">
          {t("updated", { date: formatDateLocale(page.updatedAt, locale) })}
        </p>
        <div className="mt-8">
          <Markdown>{loc(page.content, locale)}</Markdown>
        </div>
      </div>
    </div>
  );
}

// Used as: export const generateMetadata = siteMetadata("terms-and-services");
export function siteMetadata(slug: string) {
  return async ({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> => {
    const { locale } = await params;
    const page = await getSitePage(slug);
    if (!page) return {};
    return pageMetadata({
      locale,
      path: `/${slug}`,
      title: loc(page.title, locale),
      description: stripMarkdown(loc(page.content, locale)).slice(0, 155),
    });
  };
}