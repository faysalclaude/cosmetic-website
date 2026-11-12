import type { Localized } from "@/types";

type Details = {
  highlights: { ko: string[]; en: string[] };
  howToUse: Localized;
};

const details: Record<string, Details> = {
  "snail-radiance-repair-moisturizing-cream": {
    highlights: {
      ko: ["82% 달팽이 점액 여과물", "4-in-1 멀티 액션 처방", "촉촉하고 부드러운 마무리"],
      en: ["82% snail extract", "4-in-1 multi-action formula", "Soft, hydrated finish"],
    },
    howToUse: {
      ko: "세안 후 적당량을 얼굴 전체에 부드럽게 펴 발라 흡수시켜 주세요. 아침, 저녁 사용을 권장합니다.",
      en: "After cleansing, smooth an appropriate amount over the whole face until absorbed. Use morning and evening.",
    },
  },
  "the-serum-pigmentation-dark-spot-correction": {
    highlights: {
      ko: ["5% 트라넥삼산", "4.5% 나이아신아마이드", "모든 피부 타입에 적합"],
      en: ["5% tranexamic acid", "4.5% niacinamide", "Suitable for all skin types"],
    },
    howToUse: {
      ko: "세안 후 2~3방울을 얼굴에 고르게 바르고 가볍게 두드려 흡수시킨 뒤 보습제를 발라 주세요.",
      en: "After cleansing, apply two to three drops evenly, pat gently until absorbed, then follow with moisturizer.",
    },
  },
  "oil-free-acne-control-gentle-cleanser": {
    highlights: {
      ko: ["1.8% 살리실산", "오일프리 젠틀 클렌징", "자극 없이 모공을 맑게"],
      en: ["1.8% salicylic acid", "Oil-free gentle cleansing", "Clears pores without stripping"],
    },
    howToUse: {
      ko: "젖은 얼굴에 적당량을 덜어 거품을 내어 부드럽게 마사지한 뒤 미온수로 깨끗이 헹궈 주세요.",
      en: "Work an appropriate amount into a lather on a wet face, massage gently, then rinse with lukewarm water.",
    },
  },
};

export function getDetails(slug: string): Details | undefined {
  return details[slug];
}