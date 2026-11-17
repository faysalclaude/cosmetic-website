import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export type AdminSitePage = {
  slug: string;
  title_ko: string;
  title_en: string;
  content_ko: string;
  content_en: string;
  updated_at: string;
};

export async function getAdminSitePages(): Promise<AdminSitePage[]> {
  const { data, error } = await createAdminClient()
    .from("site_pages")
    .select("slug, title_ko, title_en, content_ko, content_en, updated_at")
    .order("slug", { ascending: true });

  if (error) throw new Error(error.message.slice(0, 200));
  return (data ?? []) as AdminSitePage[];
}

export async function getAdminSitePage(slug: string): Promise<AdminSitePage | null> {
  const { data, error } = await createAdminClient()
    .from("site_pages")
    .select("slug, title_ko, title_en, content_ko, content_en, updated_at")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw new Error(error.message.slice(0, 200));
  return (data as AdminSitePage | null) ?? null;
}

export type AdminMessage = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
};

export async function getAdminMessages(): Promise<AdminMessage[]> {
  const { data, error } = await createAdminClient()
    .from("contact_messages")
    .select("id, name, email, phone, subject, message, is_read, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) throw new Error(error.message.slice(0, 200));
  return (data ?? []) as AdminMessage[];
}