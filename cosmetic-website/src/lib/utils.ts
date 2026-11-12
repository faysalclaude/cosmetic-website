import type { Localized } from "@/types";
import { siteConfig } from "./site";

export function loc(value: Localized, locale: string): string {
  return locale === "en" ? value.en : value.ko;
}

export function formatKRW(value: number, locale: string): string {
  return new Intl.NumberFormat(locale === "en" ? "en-US" : "ko-KR", {
    style: "currency",
    currency: "KRW",
    maximumFractionDigits: 0,
  }).format(value);
}
export function shippingFor(subtotal: number): number {
  if (subtotal === 0) return 0;
  return subtotal >= siteConfig.shipping.freeOver ? 0 : siteConfig.shipping.fee;
}