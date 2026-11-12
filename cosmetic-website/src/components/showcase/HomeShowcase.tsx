"use client";

import { useLocale } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { defaultPalette } from "@/lib/palette";
import { useApprovedShowcases } from "@/lib/showcase-store";
import ScrollShowcase from "./ScrollShowcase";
import { defaultChapters } from "./copy";

export default function HomeShowcase() {
  const locale = useLocale();
  const router = useRouter();
  const approved = useApprovedShowcases();
  const latest = approved[0];

  const name = latest?.name ?? (locale === "en" ? "Signature Serum" : "시그니처 세럼");

  return (
    <ScrollShowcase
      palette={latest?.palette ?? defaultPalette}
      imageUrl={latest?.imageDataUrl}
      name={name}
      chapters={defaultChapters(locale, name)}
      ctaLabel={locale === "en" ? "Shop now" : "지금 구매하기"}
      onCta={() => router.push("/product-list")}
    />
  );
}