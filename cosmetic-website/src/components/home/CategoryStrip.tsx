import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { loc } from "@/lib/utils";
import type { CategoryInfo } from "@/types";
import Reveal from "@/components/ui/Reveal";

type Props = { categories: CategoryInfo[]; counts: Record<string, number> };

export default function CategoryStrip({ categories, counts }: Props) {
  const t = useTranslations("Home");
  const locale = useLocale();
  const visible = categories.filter((c) => (counts[c.id] ?? 0) > 0);
  if (visible.length === 0) return null;

  return (
    <section className="container-page pt-16">
      <Reveal className="mb-8 text-center">
        <h2 className="text-2xl font-bold tracking-tight md:text-3xl">{t("categoriesTitle")}</h2>
      </Reveal>
      <Reveal delay={0.1} className="flex flex-wrap justify-center gap-3">
        {visible.map((c) => (
          <Link
            key={c.id}
            href={`/category/${c.id}`}
            className="rounded-full border border-line bg-white px-6 py-3 text-sm font-semibold transition-colors hover:border-brand hover:bg-brand hover:text-white"
          >
            {loc(c.name, locale)}
            <span className="ml-2 text-xs font-normal opacity-60">{counts[c.id]}</span>
          </Link>
        ))}
      </Reveal>
    </section>
  );
}