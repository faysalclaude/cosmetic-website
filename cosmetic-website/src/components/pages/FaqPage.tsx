import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { ChevronDown } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { getSitePage } from "@/lib/data/pages";
import { parseFaq } from "@/lib/faq";
import { stripMarkdown } from "@/lib/seo";
import { loc } from "@/lib/utils";
import Markdown from "@/components/blog/Markdown";

export default async function FaqPage() {
  const locale = await getLocale();
  const t = await getTranslations("Pages");
  const page = await getSitePage("faq");
  if (!page) notFound();

  const title = loc(page.title, locale);
  const content = loc(page.content, locale);
  const items = parseFaq(content);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((i) => ({
      "@type": "Question",
      name: i.q,
      acceptedAnswer: { "@type": "Answer", text: stripMarkdown(i.a) },
    })),
  };

  return (
    <div className="container-page py-12">
      {items.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
        />
      )}

      <nav className="mb-8 flex items-center gap-2 text-sm text-muted">
        <Link href="/" className="hover:text-brand">
          {t("home")}
        </Link>
        <span>/</span>
        <span className="text-ink">{title}</span>
      </nav>

      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{title}</h1>

        {items.length > 0 ? (
          <div className="mt-8 divide-y divide-line rounded-3xl border border-line bg-white">
            {items.map((item) => (
              <details key={item.q} className="group px-6 py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
                  {item.q}
                  <ChevronDown
                    size={18}
                    className="shrink-0 transition-transform group-open:rotate-180"
                  />
                </summary>
                <div className="mt-3 text-sm">
                  <Markdown>{item.a}</Markdown>
                </div>
              </details>
            ))}
          </div>
        ) : (
          <div className="mt-8">
            {content.trim() ? <Markdown>{content}</Markdown> : <p className="text-sm text-muted">{t("empty")}</p>}
          </div>
        )}

        <p className="mt-8 text-center text-sm text-muted">
          {t("faqMore")}{" "}
          <Link href="/contact-us" className="font-semibold text-brand underline">
            {t("contactLink")}
          </Link>
        </p>
      </div>
    </div>
  );
}