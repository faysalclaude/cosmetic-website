export type CategoryOption = { id: string; name_ko: string; name_en: string };

// All values are strings because they come from / go to HTML inputs.
export type ProductFormValues = {
  slug: string;
  categoryId: string;
  nameKo: string;
  nameEn: string;
  heroTagKo: string;
  heroTagEn: string;
  areaKo: string;
  areaEn: string;
  summaryKo: string;
  summaryEn: string;
  howToUseKo: string;
  howToUseEn: string;
  highlightsKo: string; // one per line
  highlightsEn: string;
  price: string;
  compareAt: string;
  stock: string;
  tint: string;
  accent: string;
  isNew: boolean;
  isActive: boolean;
  sortOrder: string;
};