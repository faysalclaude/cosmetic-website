import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { siteConfig } from "@/lib/site";
import NewsletterForm from "./NewsletterForm";

export default function Footer() {
  const t = useTranslations("Footer");
  const b = siteConfig.business;

  const help = [
    { href: "/contact-us", label: t("contact") },
    { href: "/terms-and-services", label: t("terms") },
    { href: "/privacy-policy", label: t("privacy") },
    { href: "/return-and-refund", label: t("refund") },
  ];
  const shop = [
    { href: "/shop-by-country", label: t("shopByCountry") },
    { href: "/product-list", label: t("skinAnswer") },
    { href: "/faq", label: t("faq") },
    { href: "/product-list", label: t("reviews") },
  ];

  return (
    <footer className="mt-20 bg-ink text-white">
      <div className="container-page grid gap-10 py-14 md:grid-cols-4">
        <div className="md:col-span-1">
          <h3 className="mb-3 text-sm font-semibold tracking-wide uppercase">
            {t("connected")}
          </h3>
          <p className="mb-4 text-sm text-white/70">{t("subscribeText")}</p>
          <NewsletterForm />
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase">{t("help")}</h3>
          <ul className="space-y-2 text-sm text-white/70">
            {help.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-white">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase">{t("shop")}</h3>
          <ul className="space-y-2 text-sm text-white/70">
            {shop.map((l) => (
              <li key={l.label}>
                <Link href={l.href} className="hover:text-white">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase">
            {t("followUs")}
          </h3>
          <div className="flex gap-3">
            {["IG", "FB", "YT", "TT"].map((s) => (
              <a
                key={s}
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/30 text-xs hover:bg-brand"
              >
                {s}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page space-y-1 py-6 text-xs text-white/50">
          <p>
            {t("company")}: {b.company} | {t("ceo")}: {b.ceo} | {t("bizNo")}:{" "}
            {b.bizNo} | {t("ecommerceNo")}: {b.ecommerceNo}
          </p>
          <p>
            {t("address")}: {b.address} | {t("tel")}: {b.tel} | {t("email")}:{" "}
            {b.email}
          </p>
          <p>{t("demoNote")}</p>
          <p>
            © {new Date().getFullYear()} {siteConfig.logoText}. {t("rights")}
          </p>
        </div>
      </div>
    </footer>
  );
}