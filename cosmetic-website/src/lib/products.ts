import type { BlogPost, Product } from "@/types";

export const products: Product[] = [
  {
    id: "p1",
    slug: "snail-radiance-repair-moisturizing-cream",
    name: {
      ko: "스네일 래디언스 & 리페어 모이스처라이징 크림",
      en: "Snail Radiance & Repair Moisturizing Cream",
    },
    heroTag: { ko: "모이스처라이징 크림", en: "Moisturizing Cream" },
    summary: {
      ko: "82% 달팽이 점액 여과물, 4% 뽕잎 추출물, 3% 트라넥삼산, 3% 포타슘 메톡시살리실레이트가 함유된 임상 처방. 4-in-1 멀티 액션으로 색소침착을 케어하고 더 맑고 건강한 피부로 가꿔 줍니다.",
      en: "A clinical formulation enriched with 82% snail extract, 4% mulberry leaf extract, 3% tranexamic acid and 3% potassium methoxysalicylate. A 4-in-1 multi-action formula that targets pigmentation and reveals clearer, healthier skin.",
    },
    price: 32000,
    compareAt: 45000,
    tint: "#fbe9ef",
    accent: "#c2557a",
    isNew: true,
    category: "skinCare",
    area: { ko: "눈가", en: "Eyes" },
  },
  {
    id: "p2",
    slug: "the-serum-pigmentation-dark-spot-correction",
    name: {
      ko: "더 세럼 – 색소침착 & 잡티 케어",
      en: "The Serum Pigmentation & Dark Spot Correction",
    },
    heroTag: { ko: "다크 스팟", en: "Dark Spot" },
    summary: {
      ko: "5% 트라넥삼산, 4.5% 나이아신아마이드, 0.3% 4-n-부틸레조르시놀이 함유된 임상 처방. 색소침착의 원인에 집중해 더 밝고 균일한 피부 톤으로 가꿔 줍니다. 모든 피부 타입에 적합합니다.",
      en: "A clinical formulation enriched with 5% tranexamic acid, 4.5% niacinamide and 0.3% 4-n-butylresorcinol. Targets discoloration at its source for a brighter, clearer and more even-looking complexion. Ideal for all skin types.",
    },
    price: 38000,
    compareAt: 52000,
    tint: "#fdf0e0",
    accent: "#d98a2b",
    category: "skinCare",
    area: { ko: "얼굴", en: "Face" },
  },
  {
    id: "p3",
    slug: "oil-free-acne-control-gentle-cleanser",
    name: {
      ko: "오일프리 트러블 케어 젠틀 클렌저",
      en: "Oil-Free Acne Control Gentle Cleanser",
    },
    heroTag: { ko: "젠틀 클렌저", en: "Gentle Cleanser" },
    summary: {
      ko: "1.8% 살리실산이 함유된 임상 처방. 피부를 자극 없이 깊이 클렌징하고 모공을 맑게 하며 과잉 피지를 조절합니다.",
      en: "A clinical formulation enriched with 1.8% salicylic acid. Expertly crafted to deeply cleanse, unclog pores and control excess oil without stripping the skin.",
    },
    price: 18000,
    tint: "#e6f3f1",
    accent: "#2f9c8c",
    category: "skinCare",
    area: { ko: "얼굴", en: "Face" },
  },
    
];

export const blogPosts: BlogPost[] = [
  {
    slug: "a-new-trend-for-beautiful-hair-without-damage",
    category: { ko: "뷰티 팁", en: "Beauty Tips" },
    title: {
      ko: "손상 없이 아름다운 머릿결을 위한 새로운 트렌드",
      en: "A New Trend for Beautiful Hair Without Damage",
    },
    excerpt: {
      ko: "왜 히트리스 컬링이 인기일까?",
      en: "Why is Heatless Curling So Popular?",
    },
    tint: "#f6e3ea",
  },
  {
    slug: "23-foods-for-healthy-beautiful-hair",
    category: { ko: "뷰티 팁", en: "Beauty Tips" },
    title: {
      ko: "건강하고 아름다운 머릿결을 위한 음식 23가지",
      en: "23 Foods for Healthy, Beautiful Hair",
    },
    excerpt: {
      ko: "모발 건강에 도움이 되는 음식 23가지",
      en: "23 foods that are beneficial for hair health",
    },
    tint: "#e8efe2",
  },
  {
    slug: "natural-kitchen-ingredients-for-glowing-skin",
    category: { ko: "뷰티 팁", en: "Beauty Tips" },
    title: {
      ko: "빛나는 피부를 위한 주방 속 천연 재료",
      en: "Natural Kitchen Ingredients for Glowing Skin",
    },
    excerpt: {
      ko: "천연 클렌저 & 브라이트너",
      en: "Natural Skin Cleanser and Brightener",
    },
    tint: "#fbf0d9",
  },
];