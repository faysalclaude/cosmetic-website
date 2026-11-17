"use server";

import { revalidatePath } from "next/cache";
import { assertAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { BUCKET, pathFromPublicUrl } from "@/lib/storage";
import { blogSchema, type BlogInput } from "@/lib/validation/blog";

type Fail = { ok: false; error: string };
export type BlogResult = { ok: true; id?: string; message?: string } | Fail;
type UploadResult =
  | { ok: true; path: string; token: string; publicUrl: string }
  | Fail;

const str = (fd: FormData, key: string) => String(fd.get(key) ?? "");
const isUuid = (v: string) => /^[0-9a-f-]{36}$/i.test(v);
const fail = (error: string): Fail => ({ ok: false, error });
const short = (m: string) => m.slice(0, 200);
const refresh = () => revalidatePath("/", "layout");

function friendly(error: { code?: string; message: string }): string {
  if (error.code === "23505") return "That slug is already used by another post.";
  return short(error.message);
}

// A cover must be one of our own uploaded blog images (or empty).
function coverAllowed(url: string): boolean {
  if (url === "") return true;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return Boolean(base) && url.startsWith(`${base}/storage/v1/object/public/${BUCKET}/blog/`);
}

function parse(fd: FormData) {
  const parsed = blogSchema.safeParse({
    slug: str(fd, "slug"),
    categoryKo: str(fd, "categoryKo"),
    categoryEn: str(fd, "categoryEn"),
    titleKo: str(fd, "titleKo"),
    titleEn: str(fd, "titleEn"),
    excerptKo: str(fd, "excerptKo"),
    excerptEn: str(fd, "excerptEn"),
    contentKo: str(fd, "contentKo"),
    contentEn: str(fd, "contentEn"),
    coverUrl: str(fd, "coverUrl"),
    isPublished: fd.get("isPublished") === "on",
  });
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Invalid form" };
  }
  if (!coverAllowed(parsed.data.coverUrl)) {
    return { ok: false as const, error: "Invalid cover image." };
  }
  return { ok: true as const, data: parsed.data };
}

function toRow(d: BlogInput) {
  return {
    slug: d.slug,
    category_ko: d.categoryKo,
    category_en: d.categoryEn,
    title_ko: d.titleKo,
    title_en: d.titleEn,
    excerpt_ko: d.excerptKo,
    excerpt_en: d.excerptEn,
    content_ko: d.contentKo,
    content_en: d.contentEn,
    cover_url: d.coverUrl || null,
    is_published: d.isPublished,
  };
}

export async function createBlogUploadUrlAction(ext: string): Promise<UploadResult> {
  await assertAdmin();
  if (!["webp", "png", "jpg"].includes(ext)) return fail("Unsupported image type.");

  const path = `blog/${crypto.randomUUID()}/${Date.now()}.${ext}`;
  const admin = createAdminClient();

  const { data, error } = await admin.storage.from(BUCKET).createSignedUploadUrl(path);
  if (error || !data) return fail(short(error?.message ?? "Could not prepare the upload."));

  const { data: pub } = admin.storage.from(BUCKET).getPublicUrl(path);
  return { ok: true, path: data.path, token: data.token, publicUrl: pub.publicUrl };
}

export async function createPostAction(formData: FormData): Promise<BlogResult> {
  await assertAdmin();
  const parsed = parse(formData);
  if (!parsed.ok) return parsed;

  const { data, error } = await createAdminClient()
    .from("blog_posts")
    .insert({
      ...toRow(parsed.data),
      published_at: parsed.data.isPublished ? new Date().toISOString() : null,
    })
    .select("id")
    .single();

  if (error) return fail(friendly(error));
  refresh();
  return { ok: true, id: data.id as string, message: "Post created." };
}

export async function updatePostAction(id: string, formData: FormData): Promise<BlogResult> {
  await assertAdmin();
  if (!isUuid(id)) return fail("Invalid post id.");
  const parsed = parse(formData);
  if (!parsed.ok) return parsed;

  const admin = createAdminClient();
  const { data: existing } = await admin
    .from("blog_posts")
    .select("cover_url, published_at")
    .eq("id", id)
    .maybeSingle();
  if (!existing) return fail("Post not found.");

  // the slug is the public address, so it is never changed after creation
  const { slug, ...row } = toRow(parsed.data);
  void slug;

  const publishedAt =
    parsed.data.isPublished && !existing.published_at
      ? new Date().toISOString()
      : existing.published_at;

  const { error } = await admin
    .from("blog_posts")
    .update({ ...row, published_at: publishedAt })
    .eq("id", id);
  if (error) return fail(friendly(error));

  // remove the old cover file when it was replaced or removed
  const oldCover = existing.cover_url as string | null;
  if (oldCover && oldCover !== (parsed.data.coverUrl || null)) {
    const path = pathFromPublicUrl(oldCover);
    if (path) await admin.storage.from(BUCKET).remove([path]);
  }

  refresh();
  return { ok: true, id, message: "Saved. The change is live on the site." };
}

export async function togglePublishedAction(id: string, publish: boolean): Promise<BlogResult> {
  await assertAdmin();
  if (!isUuid(id)) return fail("Invalid post id.");

  const admin = createAdminClient();
  const { data: existing } = await admin
    .from("blog_posts")
    .select("published_at")
    .eq("id", id)
    .maybeSingle();
  if (!existing) return fail("Post not found.");

  const { error } = await admin
    .from("blog_posts")
    .update({
      is_published: publish,
      published_at: publish && !existing.published_at ? new Date().toISOString() : existing.published_at,
    })
    .eq("id", id);
  if (error) return fail(friendly(error));

  refresh();
  return { ok: true };
}

export async function deletePostAction(id: string): Promise<BlogResult> {
  await assertAdmin();
  if (!isUuid(id)) return fail("Invalid post id.");

  const admin = createAdminClient();
  const { data: existing } = await admin
    .from("blog_posts")
    .select("cover_url")
    .eq("id", id)
    .maybeSingle();

  const { error } = await admin.from("blog_posts").delete().eq("id", id);
  if (error) return fail(friendly(error));

  const path = existing?.cover_url ? pathFromPublicUrl(existing.cover_url as string) : null;
  if (path) await admin.storage.from(BUCKET).remove([path]);

  refresh();
  return { ok: true };
}