import { cache } from "react";
import { supabasePublic } from "@/lib/supabase/public";
import type { Category, Product } from "@/types";

type ShowcaseRow = {
  image_url: string;
  accent: string | null;
  soft: string | null;
  deep: string | null;
  is_approved: boolean;
};

type Row = {
  id: string;
  slug: string;
  category_id: Category;
  name_ko: string;
  name_en: string;
  hero_tag_ko: string | null;
  hero_tag_en: string | null;
  summary_ko: string;
  summary_en: string;
  area_ko: string;
  area_en: string;
  how_to_use_ko: string | null;
  how_to_use_en: string | null;
  highlights_ko: string[] | null;
  highlights_en: string[] | null;
  price: number;
  compare_at: number | null;
  tint: string;
  accent: string;
  is_new: boolean;
  product_images: { url: string; sort_order: number }[] | null;
  product_showcases: ShowcaseRow | ShowcaseRow[] | null;
  categories: { name_ko: string; name_en: string } | { name_ko: string; name_en: string }[] | null;
};

const SELECT =
  "*, categories(name_ko, name_en), product_images(url, sort_order), product_showcases(image_url, accent, soft, deep, is_approved)";

function mapRow(r: Row): Product {
  const sc = Array.isArray(r.product_showcases)
    ? r.product_showcases[0]
    : r.product_showcases;
  const cat = Array.isArray(r.categories) ? r.categories[0] : r.categories;

  return {
    id: r.id,
    slug: r.slug,
    name: { ko: r.name_ko, en: r.name_en },
    heroTag: { ko: r.hero_tag_ko ?? r.name_ko, en: r.hero_tag_en ?? r.name_en },
    summary: { ko: r.summary_ko, en: r.summary_en },
        area: { ko: cat?.name_ko ?? r.area_ko, en: cat?.name_en ?? r.area_en },
    howToUse: { ko: r.how_to_use_ko ?? "", en: r.how_to_use_en ?? "" },
    highlights: { ko: r.highlights_ko ?? [], en: r.highlights_en ?? [] },
    price: r.price,
    compareAt: r.compare_at ?? undefined,
    category: r.category_id,
    tint: r.tint,
    accent: r.accent,
    isNew: r.is_new,
    images: [...(r.product_images ?? [])]
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((i) => i.url),
    showcase:
      sc && sc.is_approved
        ? {
            imageUrl: sc.image_url,
            accent: sc.accent ?? r.accent,
            soft: sc.soft ?? r.tint,
            deep: sc.deep ?? "#4a0a25",
          }
        : undefined,
  };
  
}

export const getProducts = cache(async (): Promise<Product[]> => {
  const { data, error } = await supabasePublic
    .from("products")
    .select(SELECT)
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) throw new Error(`Could not load products: ${error.message}`);
  return ((data ?? []) as unknown as Row[]).map(mapRow);
});

export const getProductBySlug = cache(
  async (slug: string): Promise<Product | null> => {
    const { data, error } = await supabasePublic
      .from("products")
      .select(SELECT)
      .eq("slug", slug)
      .eq("is_active", true)
      .maybeSingle();

    if (error) throw new Error(`Could not load product: ${error.message}`);
    return data ? mapRow(data as unknown as Row) : null;
  },
);