import { useTranslations } from "next-intl";
import { siteConfig } from "@/lib/site";

export default function WhereToBuy() {
  const t = useTranslations("Home");
  return (
    <section className="bg-brand-soft py-16">
      <div className="container-page text-center">
        <span className="mb-3 inline-block rounded-full bg-brand px-3 py-1 text-xs font-semibold text-white">
          {t("hashtag")}
        </span>
        <h2 className="text-2xl font-bold md:text-3xl">{t("whereTitle")}</h2>
        <p className="mx-auto mt-2 max-w-xl text-muted">{t("whereSubtitle")}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          {siteConfig.marketplaces.map((m) => (
            <a
              key={m}
              href="#"
              className="rounded-xl border border-line bg-white px-8 py-4 text-lg font-semibold shadow-sm transition-shadow hover:shadow-md"
            >
              {m}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}