import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { siteConfig } from "@/lib/site";
import { pageMetadata } from "@/lib/seo";
import ContactForm from "@/components/contact/ContactForm";

type Params = Promise<{ locale: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Contact" });
  return pageMetadata({
    locale,
    path: "/contact-us",
    title: t("title"),
    description: t("subtitle"),
  });
}

export default async function ContactPage() {
  const t = await getTranslations("Contact");
  const b = siteConfig.business;

  const rows = [
    { label: t("company"), value: b.company },
    { label: t("address"), value: b.address },
    { label: t("tel"), value: b.tel },
    { label: t("email"), value: b.email },
  ];

  return (
    <div className="container-page py-12">
      <nav className="mb-8 flex items-center gap-2 text-sm text-muted">
        <Link href="/" className="hover:text-brand">
          {t("home")}
        </Link>
        <span>/</span>
        <span className="text-ink">{t("title")}</span>
      </nav>

      <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{t("title")}</h1>
      <p className="mt-2 max-w-2xl text-muted">{t("subtitle")}</p>

      <div className="mt-10 grid gap-10 lg:grid-cols-[340px_1fr]">
        <aside className="h-fit rounded-3xl bg-cream p-6">
          <h2 className="mb-4 text-lg font-semibold">{t("infoTitle")}</h2>
          <dl className="space-y-4 text-sm">
            {rows.map((r) => (
              <div key={r.label}>
                <dt className="text-muted">{r.label}</dt>
                <dd className="font-medium">{r.value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-5 text-xs text-muted">{t("demoNote")}</p>
        </aside>

        <ContactForm />
      </div>
    </div>
  );
}