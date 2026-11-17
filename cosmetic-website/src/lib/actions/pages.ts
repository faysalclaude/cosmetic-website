"use server";

import { revalidatePath } from "next/cache";
import { assertAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

type Fail = { ok: false; error: string };
export type PageResult = { ok: true; message?: string } | Fail;

const str = (fd: FormData, key: string) => String(fd.get(key) ?? "");
const fail = (error: string): Fail => ({ ok: false, error });

export async function updateSitePageAction(
  slug: string,
  formData: FormData,
): Promise<PageResult> {
  await assertAdmin();
  if (!/^[a-z0-9-]{2,60}$/.test(slug)) return fail("Invalid page.");

  const titleKo = str(formData, "titleKo").trim();
  const titleEn = str(formData, "titleEn").trim();
  const contentKo = str(formData, "contentKo").replace(/\r\n?/g, "\n");
  const contentEn = str(formData, "contentEn").replace(/\r\n?/g, "\n");

  if (!titleKo || !titleEn) return fail("Both titles are required.");
  if (titleKo.length > 120 || titleEn.length > 120) return fail("A title is too long.");
  if (contentKo.length > 60000 || contentEn.length > 60000) return fail("The text is too long.");

  const { data, error } = await createAdminClient()
    .from("site_pages")
    .update({
      title_ko: titleKo,
      title_en: titleEn,
      content_ko: contentKo,
      content_en: contentEn,
    })
    .eq("slug", slug)
    .select("slug");

  if (error) return fail(error.message.slice(0, 200));
  if (!data?.length) return fail("Page not found.");

  revalidatePath("/", "layout");
  return { ok: true, message: "Saved. The change is live on the site." };
}