import { cache } from "react";
import { supabasePublic } from "@/lib/supabase/public";
import type { CategoryInfo } from "@/types";

export const getCategories = cache(async (): Promise<CategoryInfo[]> => {
  const { data, error } = await supabasePublic
    .from("categories")
    .select("id, name_ko, name_en, description_ko, description_en")
    .order("sort_order", { ascending: true });

  if (error) throw new Error(`Could not load categories: ${error.message.slice(0, 200)}`);

  return (data ?? []).map((r) => ({
    id: r.id as string,
    name: { ko: r.name_ko as string, en: r.name_en as string },
    description: {
      ko: (r.description_ko as string | null) ?? "",
      en: (r.description_en as string | null) ?? "",
    },
  }));
});