"use server";

import { revalidatePath } from "next/cache";
import { assertAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { productSchema, type ProductInput } from "@/lib/validation/product";
import { BUCKET, pathFromPublicUrl } from "@/lib/storage";

export type ProductActionResult =
  | { ok: true; id?: string; message?: string }
  | { ok: false; error: string };

const str = (fd: FormData, key: string) => String(fd.get(key) ?? "");
const isUuid = (v: string) => /^[0-9a-f-]{36}$/i.test(v);

function friendlyError(error: { code?: string; message: string }): string {
  if (error.code === "23505") return "That slug is already used by another product.";
  if (error.code === "23514") return "Compare-at price must be at least the price.";
  if (error.code === "23503") return "Unknown category.";
  return error.message.slice(0, 200);
}

function parseProductForm(fd: FormData) {
  const parsed = productSchema.safeParse({
    slug: str(fd, "slug"),
    categoryId: str(fd, "categoryId"),
    nameKo: str(fd, "nameKo"),
    nameEn: str(fd, "nameEn"),
    heroTagKo: str(fd, "heroTagKo"),
    heroTagEn: str(fd, "heroTagEn"),
    areaKo: str(fd, "areaKo"),
    areaEn: str(fd, "areaEn"),
    summaryKo: str(fd, "summaryKo"),
    summaryEn: str(fd, "summaryEn"),
    howToUseKo: str(fd, "howToUseKo"),
    howToUseEn: str(fd, "howToUseEn"),
    highlightsKo: str(fd, "highlightsKo"),
    highlightsEn: str(fd, "highlightsEn"),
    price: str(fd, "price"),
    compareAt: str(fd, "compareAt"),
    stock: str(fd, "stock"),
    tint: str(fd, "tint"),
    accent: str(fd, "accent"),
    isNew: fd.get("isNew") === "on",
    isActive: fd.get("isActive") === "on",
    sortOrder: str(fd, "sortOrder"),
  });

  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Invalid form" };
  }
  return { ok: true as const, data: parsed.data };
}

function toRow(d: ProductInput) {
  return {
    slug: d.slug,
    category_id: d.categoryId,
    name_ko: d.nameKo,
    name_en: d.nameEn,
    hero_tag_ko: d.heroTagKo || null,
    hero_tag_en: d.heroTagEn || null,
    summary_ko: d.summaryKo,
    summary_en: d.summaryEn,
    area_ko: d.areaKo,
    area_en: d.areaEn,
    how_to_use_ko: d.howToUseKo || null,
    how_to_use_en: d.howToUseEn || null,
    highlights_ko: d.highlightsKo,
    highlights_en: d.highlightsEn,
    price: d.price,
    compare_at: d.compareAt,
    stock: d.stock,
    tint: d.tint,
    accent: d.accent,
    is_new: d.isNew,
    is_active: d.isActive,
    sort_order: d.sortOrder,
  };
}

// Make storefront pages show the change immediately.
function refreshStorefront() {
  revalidatePath("/", "layout");
}

export async function createProductAction(
  _prev: ProductActionResult | null,
  formData: FormData,
): Promise<ProductActionResult> {
  await assertAdmin();
  const parsed = parseProductForm(formData);
  if (!parsed.ok) return parsed;

  const { data, error } = await createAdminClient()
    .from("products")
    .insert(toRow(parsed.data))
    .select("id")
    .single();

  if (error) return { ok: false, error: friendlyError(error) };

  refreshStorefront();
  return { ok: true, id: data.id as string, message: "Product created." };
}

export async function updateProductAction(
  id: string,
  _prev: ProductActionResult | null,
  formData: FormData,
): Promise<ProductActionResult> {
  await assertAdmin();
  if (!isUuid(id)) return { ok: false, error: "Invalid product id." };

  const parsed = parseProductForm(formData);
  if (!parsed.ok) return parsed;

  // The slug is the public URL, so it is never changed after creation.
  const { slug, ...row } = toRow(parsed.data);
  void slug;

  const { error } = await createAdminClient().from("products").update(row).eq("id", id);
  if (error) return { ok: false, error: friendlyError(error) };

  refreshStorefront();
  return { ok: true, id, message: "Saved. The change is live on the site." };
}

export async function toggleActiveAction(
  id: string,
  active: boolean,
): Promise<ProductActionResult> {
  await assertAdmin();
  if (!isUuid(id)) return { ok: false, error: "Invalid product id." };

  const { error } = await createAdminClient()
    .from("products")
    .update({ is_active: active })
    .eq("id", id);

  if (error) return { ok: false, error: friendlyError(error) };
  refreshStorefront();
  return { ok: true };
}

export async function deleteProductAction(id: string): Promise<ProductActionResult> {
  await assertAdmin();
  if (!isUuid(id)) return { ok: false, error: "Invalid product id." };

  const admin = createAdminClient();

  // collect the storage files first, because the rows disappear with the product
  const [{ data: images }, { data: showcase }] = await Promise.all([
    admin.from("product_images").select("url").eq("product_id", id),
    admin.from("product_showcases").select("image_url").eq("product_id", id).maybeSingle(),
  ]);
  const paths = [
    ...(images ?? []).map((i) => i.url as string),
    ...(showcase?.image_url ? [showcase.image_url as string] : []),
  ]
    .map(pathFromPublicUrl)
    .filter((p): p is string => Boolean(p));

  const { error } = await admin.from("products").delete().eq("id", id);
  if (error) return { ok: false, error: friendlyError(error) };

  if (paths.length) await admin.storage.from(BUCKET).remove(paths);

  refreshStorefront();
  return { ok: true };
}