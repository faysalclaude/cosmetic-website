"use client";

import { useLocale } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import type { Palette } from "@/lib/palette";
import { loc } from "@/lib/utils";
import type { Localized } from "@/types";
import ScrollShowcase from "./ScrollShowcase";
import { defaultChapters } from "./copy";

type Props = {
  showcase?: { name: Localized; imageUrl: string; palette: Palette };
};

// Shown only when the admin has approved a showcase for a product.
export default function HomeShowcase({ showcase }: Props) {
  const locale = useLocale();
  const router = useRouter();
  if (!showcase) return null;

  const name = loc(showcase.name, locale);

  return (
    <ScrollShowcase
      palette={showcase.palette}
      imageUrl={showcase.imageUrl}
      name={name}
      chapters={defaultChapters(locale, name)}
      ctaLabel={locale === "en" ? "Shop now" : "지금 구매하기"}
      onCta={() => router.push("/product-list")}
    />
  );
}