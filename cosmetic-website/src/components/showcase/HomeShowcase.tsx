"use client";

import { useLocale } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { defaultPalette, type Palette } from "@/lib/palette";
import { useApprovedShowcases } from "@/lib/showcase-store";
import { loc } from "@/lib/utils";
import type { Localized } from "@/types";
import ScrollShowcase from "./ScrollShowcase";
import { defaultChapters } from "./copy";

type Props = {
  fallback?: { name: Localized; imageUrl: string; palette: Palette };
};

export default function HomeShowcase({ fallback }: Props) {
  const locale = useLocale();
  const router = useRouter();
  // Prototype: a showcase approved in this browser's Studio wins over the database one.
  const latest = useApprovedShowcases()[0];

  const name =
    latest?.name ??
    (fallback ? loc(fallback.name, locale) : locale === "en" ? "Signature Serum" : "시그니처 세럼");

  return (
    <ScrollShowcase
      palette={latest?.palette ?? fallback?.palette ?? defaultPalette}
      imageUrl={latest?.imageDataUrl ?? fallback?.imageUrl}
      name={name}
      chapters={defaultChapters(locale, name)}
      ctaLabel={locale === "en" ? "Shop now" : "지금 구매하기"}
      onCta={() => router.push("/product-list")}
    />
  );
}