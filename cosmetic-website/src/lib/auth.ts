import "server-only";
import { cache } from "react";
import { notFound } from "next/navigation";
import { getLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";

export type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  role: "customer" | "admin";
};

export const getCurrentProfile = cache(async (): Promise<Profile | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("id, email, full_name, phone, role")
    .eq("id", user.id)
    .maybeSingle();

  return (data as Profile | null) ?? null;
});

// Call this in the admin layout AND at the top of every admin page.
export async function requireAdmin(nextPath = "/admin"): Promise<Profile> {
  const profile = await getCurrentProfile();
  if (!profile) {
    const locale = await getLocale();
    return redirect({
      href: `/login?next=${encodeURIComponent(nextPath)}`,
      locale,
    });
  }
  if (profile.role !== "admin") return notFound();
  return profile;
}

// For server actions: throws unless the caller is a logged-in admin.
export async function assertAdmin(): Promise<Profile> {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "admin") throw new Error("Unauthorized");
  return profile;
}