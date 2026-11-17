import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { BlogFormValues } from "@/types/admin";

export type AdminPostRow = {
  id: string;
  slug: string;
  category_ko: string;
  category_en: string;
  title_ko: string;
  title_en: string;
  excerpt_ko: string;
  excerpt_en: string;
  content_ko: string;
  content_en: string;
  cover_url: string | null;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
};

export type AdminPostListRow = Pick<
  AdminPostRow,
  "id" | "slug" | "title_ko" | "title_en" | "category_en" | "cover_url" | "is_published" | "published_at" | "created_at"
>;

export async function getAdminPosts(): Promise<AdminPostListRow[]> {
  const { data, error } = await createAdminClient()
    .from("blog_posts")
    .select("id, slug, title_ko, title_en, category_en, cover_url, is_published, published_at, created_at")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message.slice(0, 200));
  return (data ?? []) as AdminPostListRow[];
}

export async function getAdminPost(id: string): Promise<AdminPostRow | null> {
  const { data, error } = await createAdminClient()
    .from("blog_posts")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message.slice(0, 200));
  return (data as AdminPostRow | null) ?? null;
}

export function toBlogFormValues(r: AdminPostRow): BlogFormValues {
  return {
    slug: r.slug,
    categoryKo: r.category_ko,
    categoryEn: r.category_en,
    titleKo: r.title_ko,
    titleEn: r.title_en,
    excerptKo: r.excerpt_ko,
    excerptEn: r.excerpt_en,
    contentKo: r.content_ko,
    contentEn: r.content_en,
    coverUrl: r.cover_url ?? "",
    isPublished: r.is_published,
  };
}