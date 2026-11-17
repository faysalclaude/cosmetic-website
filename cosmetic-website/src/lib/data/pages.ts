import { cache } from "react";
import { supabasePublic } from "@/lib/supabase/public";
import type { Localized } from "@/types";

export type SitePageData = {
  slug: string;
  title: Localized;
  content: Localized;
  updatedAt: string;
};

export const getSitePage = cache(async (slug: string): Promise<SitePageData | null> => {
  const { data, error } = await supabasePublic
    .from("site_pages")
    .select("slug, title_ko, title_en, content_ko, content_en, updated_at")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw new Error(`Could not load the page: ${error.message.slice(0, 200)}`);
  if (!data) return null;

  return {
    slug: data.slug as string,
    title: { ko: data.title_ko as string, en: data.title_en as string },
    content: { ko: data.content_ko as string, en: data.content_en as string },
    updatedAt: data.updated_at as string,
  };
});