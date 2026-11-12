export type Localized = { ko: string; en: string };

export type Category = "skinCare" | "hairCare" | "makeup";

export type Product = {
  id: string;
  slug: string;
  name: Localized;
  heroTag: Localized;
  summary: Localized;
  price: number; // KRW
  compareAt?: number;
  category: Category;
  area: Localized; // e.g. Face, Eyes
  tint: string;
  accent: string;
  isNew?: boolean;
};

export type BlogPost = {
  slug: string;
  category: Localized;
  title: Localized;
  excerpt: Localized;
  tint: string;
};