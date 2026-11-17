import { cache } from "react";
import { supabasePublic } from "@/lib/supabase/public";
import type { BlogPost } from "@/types";

type Row = {
  slug: string;
  category_ko: string;
  category_en: string;
  title_ko: string;
  title_en: string;
  excerpt_ko: string;
  excerpt_en: string;
  content_ko?: string;
  content_en?: string;
  cover_url: string | null;
  published_at: string | null;
};

const LIST_COLUMNS =
  "slug, category_ko, category_en, title_ko, title_en, excerpt_ko, excerpt_en, cover_url, published_at";
const FULL_COLUMNS = `${LIST_COLUMNS}, content_ko, content_en`;

function mapRow(r: Row): BlogPost {
  return {
    slug: r.slug,
    category: { ko: r.category_ko, en: r.category_en },
    title: { ko: r.title_ko, en: r.title_en },
    excerpt: { ko: r.excerpt_ko, en: r.excerpt_en },
    content: { ko: r.content_ko ?? "", en: r.content_en ?? "" },
    coverUrl: r.cover_url,
    publishedAt: r.published_at,
  };
}

export const getPublishedPosts = cache(async (limit = 50): Promise<BlogPost[]> => {
  const { data, error } = await supabasePublic
    .from("blog_posts")
    .select(LIST_COLUMNS)
    .eq("is_published", true)
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(`Could not load posts: ${error.message.slice(0, 200)}`);
  return ((data ?? []) as unknown as Row[]).map(mapRow);
});

export const getPostBySlug = cache(async (slug: string): Promise<BlogPost | null> => {
  const { data, error } = await supabasePublic
    .from("blog_posts")
    .select(FULL_COLUMNS)
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (error) throw new Error(`Could not load the post: ${error.message.slice(0, 200)}`);
  return data ? mapRow(data as unknown as Row) : null;
});