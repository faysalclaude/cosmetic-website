import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { CategoryOption, ProductFormValues } from "@/types/admin";

export type AdminProductRow = {
  id: string;
  slug: string;
  category_id: string;
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
  stock: number;
  tint: string;
  accent: string;
  is_new: boolean;
  is_active: boolean;
  sort_order: number;
};

export type AdminListRow = Pick<
  AdminProductRow,
  | "id"
  | "slug"
  | "category_id"
  | "name_ko"
  | "name_en"
  | "price"
  | "compare_at"
  | "stock"
  | "tint"
  | "accent"
  | "is_new"
  | "is_active"
  | "sort_order"
> & { product_images: { url: string; sort_order: number }[] | null };

export async function getAdminProducts(): Promise<AdminListRow[]> {
  const { data, error } = await createAdminClient()
    .from("products")
    .select(
      "id, slug, category_id, name_ko, name_en, price, compare_at, stock, tint, accent, is_new, is_active, sort_order, product_images(url, sort_order)",
    )
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message.slice(0, 200));
  return (data ?? []) as unknown as AdminListRow[];
}

export async function getAdminProduct(id: string): Promise<AdminProductRow | null> {
  const { data, error } = await createAdminClient()
    .from("products")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message.slice(0, 200));
  return (data as AdminProductRow | null) ?? null;
}

export async function getCategoryOptions(): Promise<CategoryOption[]> {
  const { data, error } = await createAdminClient()
    .from("categories")
    .select("id, name_ko, name_en")
    .order("sort_order", { ascending: true });

  if (error) throw new Error(error.message.slice(0, 200));
  return (data ?? []) as CategoryOption[];
}

export function toFormValues(r: AdminProductRow): ProductFormValues {
  return {
    slug: r.slug,
    categoryId: r.category_id,
    nameKo: r.name_ko,
    nameEn: r.name_en,
    heroTagKo: r.hero_tag_ko ?? "",
    heroTagEn: r.hero_tag_en ?? "",
    areaKo: r.area_ko,
    areaEn: r.area_en,
    summaryKo: r.summary_ko,
    summaryEn: r.summary_en,
    howToUseKo: r.how_to_use_ko ?? "",
    howToUseEn: r.how_to_use_en ?? "",
    highlightsKo: (r.highlights_ko ?? []).join("\n"),
    highlightsEn: (r.highlights_en ?? []).join("\n"),
    price: String(r.price),
    compareAt: r.compare_at == null ? "" : String(r.compare_at),
    stock: String(r.stock),
    tint: r.tint,
    accent: r.accent,
    isNew: r.is_new,
    isActive: r.is_active,
    sortOrder: String(r.sort_order),
  };
}
export type AdminImage = { id: string; url: string; sort_order: number };

export async function getAdminImages(productId: string): Promise<AdminImage[]> {
  const { data, error } = await createAdminClient()
    .from("product_images")
    .select("id, url, sort_order")
    .eq("product_id", productId)
    .order("sort_order", { ascending: true });

  if (error) throw new Error(error.message.slice(0, 200));
  return (data ?? []) as AdminImage[];
}

export type AdminShowcase = {
  image_url: string;
  accent: string | null;
  soft: string | null;
  deep: string | null;
  is_approved: boolean;
};

export async function getAdminShowcase(productId: string): Promise<AdminShowcase | null> {
  const { data, error } = await createAdminClient()
    .from("product_showcases")
    .select("image_url, accent, soft, deep, is_approved")
    .eq("product_id", productId)
    .maybeSingle();

  if (error) throw new Error(error.message.slice(0, 200));
  return (data as AdminShowcase | null) ?? null;
}
export type AdminCategory = {
  id: string;
  name_ko: string;
  name_en: string;
  description_ko: string | null;
  description_en: string | null;
  sort_order: number;
  productCount: number;
};

export async function getAdminCategories(): Promise<AdminCategory[]> {
  const admin = createAdminClient();
  const [cats, prods] = await Promise.all([
    admin
      .from("categories")
      .select("id, name_ko, name_en, description_ko, description_en, sort_order")
      .order("sort_order", { ascending: true }),
    admin.from("products").select("category_id"),
  ]);
  if (cats.error) throw new Error(cats.error.message.slice(0, 200));

  const counts = new Map<string, number>();
  for (const p of prods.data ?? []) {
    counts.set(p.category_id, (counts.get(p.category_id) ?? 0) + 1);
  }

  return (cats.data ?? []).map((c) => ({
    ...(c as Omit<AdminCategory, "productCount">),
    productCount: counts.get(c.id as string) ?? 0,
  }));
}