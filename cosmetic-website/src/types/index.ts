export type Localized = { ko: string; en: string };

export type Category = "skinCare" | "hairCare" | "makeup";

export type ProductShowcase = {
  imageUrl: string;
  accent: string;
  soft: string;
  deep: string;
};

export type Product = {
  id: string;
  slug: string;
  name: Localized;
  heroTag: Localized;
  summary: Localized;
  area: Localized; // e.g. Face, Eyes
  howToUse: Localized;
  highlights: { ko: string[]; en: string[] };
  price: number; // KRW
  compareAt?: number;
  category: Category;
  tint: string;
  accent: string;
  isNew?: boolean;
  images: string[];
  showcase?: ProductShowcase;
};

export type BlogPost = {
  slug: string;
  category: Localized;
  title: Localized;
  excerpt: Localized;
  tint: string;
};