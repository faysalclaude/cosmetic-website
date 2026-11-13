"use server";

import { revalidatePath } from "next/cache";
import { assertAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

type Fail = { ok: false; error: string };
export type CategoryResult = { ok: true; message?: string } | Fail;

const str = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();
const fail = (error: string): Fail => ({ ok: false, error });
const short = (m: string) => m.slice(0, 200);
const refresh = () => revalidatePath("/", "layout");
const isExistingId = (id: string) => /^[a-zA-Z0-9-]{2,40}$/.test(id);

function readFields(fd: FormData) {
  const nameKo = str(fd, "nameKo");
  const nameEn = str(fd, "nameEn");
  const descKo = str(fd, "descKo");
  const descEn = str(fd, "descEn");
  const sort = str(fd, "sortOrder");

  if (!nameKo) return fail("Korean name is required.");
  if (!nameEn) return fail("English name is required.");
  if (nameKo.length > 60 || nameEn.length > 60) return fail("Names can be at most 60 characters.");
  if (descKo.length > 600 || descEn.length > 600) {
    return fail("Descriptions can be at most 600 characters.");
  }
  if (!/^\d{1,5}$/.test(sort)) return fail("Sort order must be a whole number.");

  return { ok: true as const, nameKo, nameEn, descKo, descEn, sortOrder: Number(sort) };
}

export async function createCategoryAction(formData: FormData): Promise<CategoryResult> {
  await assertAdmin();

  const id = str(formData, "id");
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id) || id.length < 2 || id.length > 40) {
    return fail("Address must be 2-40 characters: lowercase letters, numbers and hyphens.");
  }
  const f = readFields(formData);
  if (!f.ok) return f;

  const { error } = await createAdminClient().from("categories").insert({
    id,
    name_ko: f.nameKo,
    name_en: f.nameEn,
    description_ko: f.descKo,
    description_en: f.descEn,
    sort_order: f.sortOrder,
  });
  if (error) {
    return fail(
      error.code === "23505" ? "A category with this address already exists." : short(error.message),
    );
  }

  refresh();
  return { ok: true, message: "Category added." };
}

export async function updateCategoryAction(
  id: string,
  formData: FormData,
): Promise<CategoryResult> {
  await assertAdmin();
  if (!isExistingId(id)) return fail("Invalid category.");
  const f = readFields(formData);
  if (!f.ok) return f;

  // The address (id) is part of public links, so it is never changed.
  const { error } = await createAdminClient()
    .from("categories")
    .update({
      name_ko: f.nameKo,
      name_en: f.nameEn,
      description_ko: f.descKo,
      description_en: f.descEn,
      sort_order: f.sortOrder,
    })
    .eq("id", id);
  if (error) return fail(short(error.message));

  refresh();
  return { ok: true, message: "Saved." };
}

export async function deleteCategoryAction(id: string): Promise<CategoryResult> {
  await assertAdmin();
  if (!isExistingId(id)) return fail("Invalid category.");

  const admin = createAdminClient();
  const { count } = await admin
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("category_id", id);

  if ((count ?? 0) > 0) {
    return fail(`${count} product(s) still use this category. Move them to another category first.`);
  }

  const { error } = await admin.from("categories").delete().eq("id", id);
  if (error) {
    return fail(
      error.code === "23503" ? "Products still use this category." : short(error.message),
    );
  }

  refresh();
  return { ok: true };
}