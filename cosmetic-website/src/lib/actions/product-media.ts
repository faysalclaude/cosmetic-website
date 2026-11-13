"use server";

import { revalidatePath } from "next/cache";
import { assertAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { BUCKET, pathFromPublicUrl } from "@/lib/storage";

const MAX_IMAGES = 8;
const isUuid = (v: string) => /^[0-9a-f-]{36}$/i.test(v);
const isHex = (v: string) => /^#[0-9a-fA-F]{6}$/.test(v);

type Fail = { ok: false; error: string };
type Result = { ok: true } | Fail;
type UploadResult = { ok: true; path: string; token: string } | Fail;

const fail = (error: string): Fail => ({ ok: false, error });
const short = (m: string) => m.slice(0, 200);
const refresh = () => revalidatePath("/", "layout");

export async function createUploadUrlAction(
  productId: string,
  kind: "image" | "showcase",
  ext: string,
): Promise<UploadResult> {
  await assertAdmin();
  if (!isUuid(productId)) return fail("Invalid product id.");
  if (!["webp", "png", "jpg"].includes(ext)) return fail("Unsupported image type.");

  const folder = kind === "showcase" ? "showcases" : "products";
  const path = `${folder}/${productId}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;

  const { data, error } = await createAdminClient()
    .storage.from(BUCKET)
    .createSignedUploadUrl(path);

  if (error || !data) return fail(short(error?.message ?? "Could not prepare the upload."));
  return { ok: true, path: data.path, token: data.token };
}

export async function registerImageAction(productId: string, path: string): Promise<Result> {
  await assertAdmin();
  if (!isUuid(productId) || !path.startsWith(`products/${productId}/`)) {
    return fail("Invalid request.");
  }

  const admin = createAdminClient();

  const { count } = await admin
    .from("product_images")
    .select("*", { count: "exact", head: true })
    .eq("product_id", productId);

  if ((count ?? 0) >= MAX_IMAGES) {
    await admin.storage.from(BUCKET).remove([path]);
    return fail(`A product can have at most ${MAX_IMAGES} images.`);
  }

  const { data: last } = await admin
    .from("product_images")
    .select("sort_order")
    .eq("product_id", productId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: pub } = admin.storage.from(BUCKET).getPublicUrl(path);

  const { error } = await admin.from("product_images").insert({
    product_id: productId,
    url: pub.publicUrl,
    sort_order: (last?.sort_order ?? -1) + 1,
  });
  if (error) return fail(short(error.message));

  refresh();
  return { ok: true };
}

export async function reorderImagesAction(
  productId: string,
  orderedIds: string[],
): Promise<Result> {
  await assertAdmin();
  if (!isUuid(productId) || orderedIds.length > MAX_IMAGES || !orderedIds.every(isUuid)) {
    return fail("Invalid request.");
  }

  const admin = createAdminClient();
  const results = await Promise.all(
    orderedIds.map((id, index) =>
      admin
        .from("product_images")
        .update({ sort_order: index })
        .eq("id", id)
        .eq("product_id", productId),
    ),
  );
  const failed = results.find((r) => r.error);
  if (failed?.error) return fail(short(failed.error.message));

  refresh();
  return { ok: true };
}

export async function deleteImageAction(imageId: string): Promise<Result> {
  await assertAdmin();
  if (!isUuid(imageId)) return fail("Invalid image id.");

  const admin = createAdminClient();
  const { data: row } = await admin
    .from("product_images")
    .select("url")
    .eq("id", imageId)
    .maybeSingle();
  if (!row) return fail("Image not found.");

  const { error } = await admin.from("product_images").delete().eq("id", imageId);
  if (error) return fail(short(error.message));

  const path = pathFromPublicUrl(row.url);
  if (path) await admin.storage.from(BUCKET).remove([path]);

  refresh();
  return { ok: true };
}

// Used by "match colours to the photo": the card and slider background follow the image.
export async function updateProductColorsAction(
  productId: string,
  tint: string,
  accent: string,
): Promise<Result> {
  await assertAdmin();
  if (!isUuid(productId) || !isHex(tint) || !isHex(accent)) return fail("Invalid request.");

  const { error } = await createAdminClient()
    .from("products")
    .update({ tint, accent })
    .eq("id", productId);
  if (error) return fail(short(error.message));

  refresh();
  return { ok: true };
}

export async function saveShowcaseAction(
  productId: string,
  path: string,
  palette: { accent: string; soft: string; deep: string },
  approve: boolean,
): Promise<Result> {
  await assertAdmin();
  if (
    !isUuid(productId) ||
    !path.startsWith(`showcases/${productId}/`) ||
    !isHex(palette.accent) ||
    !isHex(palette.soft) ||
    !isHex(palette.deep)
  ) {
    return fail("Invalid request.");
  }

  const admin = createAdminClient();

  const { data: existing } = await admin
    .from("product_showcases")
    .select("image_url")
    .eq("product_id", productId)
    .maybeSingle();

  const { data: pub } = admin.storage.from(BUCKET).getPublicUrl(path);

  const { error } = await admin.from("product_showcases").upsert(
    {
      product_id: productId,
      image_url: pub.publicUrl,
      accent: palette.accent,
      soft: palette.soft,
      deep: palette.deep,
      is_approved: approve,
      approved_at: approve ? new Date().toISOString() : null,
    },
    { onConflict: "product_id" },
  );
  if (error) return fail(short(error.message));

  const oldPath = existing?.image_url ? pathFromPublicUrl(existing.image_url) : null;
  if (oldPath && oldPath !== path) await admin.storage.from(BUCKET).remove([oldPath]);

  refresh();
  return { ok: true };
}

export async function setShowcaseApprovedAction(
  productId: string,
  approved: boolean,
): Promise<Result> {
  await assertAdmin();
  if (!isUuid(productId)) return fail("Invalid product id.");

  const { error } = await createAdminClient()
    .from("product_showcases")
    .update({ is_approved: approved, approved_at: approved ? new Date().toISOString() : null })
    .eq("product_id", productId);
  if (error) return fail(short(error.message));

  refresh();
  return { ok: true };
}

export async function deleteShowcaseAction(productId: string): Promise<Result> {
  await assertAdmin();
  if (!isUuid(productId)) return fail("Invalid product id.");

  const admin = createAdminClient();
  const { data: row } = await admin
    .from("product_showcases")
    .select("image_url")
    .eq("product_id", productId)
    .maybeSingle();

  const { error } = await admin.from("product_showcases").delete().eq("product_id", productId);
  if (error) return fail(short(error.message));

  const path = row?.image_url ? pathFromPublicUrl(row.image_url) : null;
  if (path) await admin.storage.from(BUCKET).remove([path]);

  refresh();
  return { ok: true };
}