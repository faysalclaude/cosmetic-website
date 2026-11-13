"use server";

import { headers } from "next/headers";
import { getLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  firstIssue,
  forgotSchema,
  loginSchema,
  profileSchema,
  registerSchema,
} from "@/lib/validation/auth";

export type ActionResult =
  | { ok: true; redirectTo?: string; message?: string }
  | { ok: false; error: string };

const text = (fd: FormData, key: string) => String(fd.get(key) ?? "");

function safeNext(value: string): string | null {
  return value.startsWith("/") && !value.startsWith("//") && !value.includes("\\")
    ? value
    : null;
}

const withLocale = (locale: string, path: string) =>
  locale === "en" ? `/en${path}` : path;

async function clientInfo() {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() ?? h.get("x-real-ip") ?? null;
  return { ip, userAgent: h.get("user-agent") };
}

async function writeLoginLog(entry: {
  user_id?: string;
  email: string;
  success: boolean;
  reason?: string;
}) {
  try {
    const { ip, userAgent } = await clientInfo();
    const admin = createAdminClient();
    await admin.from("login_logs").insert({
      ...entry,
      ip_address: ip,
      user_agent: userAgent?.slice(0, 300) ?? null,
    });
  } catch (err) {
    console.error("Could not write login log", err);
  }
}

export async function loginAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = loginSchema.safeParse({
    email: text(formData, "email"),
    password: text(formData, "password"),
  });
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };

  const { email, password } = parsed.data;
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    await writeLoginLog({
      email,
      success: false,
      reason: error?.code ?? error?.message ?? "unknown",
    });
    return {
      ok: false,
      error: error?.code === "email_not_confirmed" ? "emailNotConfirmed" : "invalidCredentials",
    };
  }

  await writeLoginLog({ user_id: data.user.id, email, success: true });

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle();

  const locale = await getLocale();
  const fallback = profile?.role === "admin" ? "/admin" : "/my-page";
  const next = safeNext(text(formData, "next")) ?? fallback;
  return { ok: true, redirectTo: withLocale(locale, next) };
}

export async function registerAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = registerSchema.safeParse({
    fullName: text(formData, "fullName"),
    email: text(formData, "email"),
    phone: text(formData, "phone"),
    password: text(formData, "password"),
    confirmPassword: text(formData, "confirmPassword"),
  });
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };
  if (text(formData, "agree") !== "on") return { ok: false, error: "mustAgree" };

  const { fullName, email, phone, password } = parsed.data;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, phone },
      emailRedirectTo: `${siteUrl}/api/auth/callback`,
    },
  });

  if (error) {
    return {
      ok: false,
      error:
        error.code === "user_already_exists"
          ? "emailTaken"
          : error.code === "weak_password"
            ? "passwordShort"
            : "registerFailed",
    };
  }

  const locale = await getLocale();

  if (data.session && data.user) {
    await writeLoginLog({ user_id: data.user.id, email, success: true, reason: "registered" });
    return { ok: true, redirectTo: withLocale(locale, "/my-page") };
  }

  return { ok: true, message: "checkEmail" };
}

export async function forgotPasswordAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = forgotSchema.safeParse({ email: text(formData, "email") });
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };

  const locale = await getLocale();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const next = encodeURIComponent(withLocale(locale, "/reset-password"));

  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${siteUrl}/api/auth/callback?next=${next}`,
  });

  // Same answer whether or not the email exists (does not reveal who has an account).
  return { ok: true, message: "resetSent" };
}

export async function updateProfileAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = profileSchema.safeParse({
    fullName: text(formData, "fullName"),
    phone: text(formData, "phone"),
  });
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "notLoggedIn" };

  const { error } = await supabase
    .from("profiles")
    .update({ full_name: parsed.data.fullName, phone: parsed.data.phone })
    .eq("id", user.id);

  if (error) return { ok: false, error: "generic" };
  return { ok: true, message: "profileSaved" };
}