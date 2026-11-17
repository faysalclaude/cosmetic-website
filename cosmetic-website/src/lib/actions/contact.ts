"use server";

import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { contactSchema } from "@/lib/validation/contact";

export type ContactResult = { ok: true } | { ok: false; error: string };

export async function submitContactAction(input: unknown): Promise<ContactResult> {
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "generic" };
  }
  const d = parsed.data;

  // bots fill the hidden field: pretend it worked, store nothing
  if (d.website) return { ok: true };

  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() ?? h.get("x-real-ip") ?? null;

  const admin = createAdminClient();

  // at most 5 messages per hour from one address
  if (ip) {
    const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count } = await admin
      .from("contact_messages")
      .select("*", { count: "exact", head: true })
      .eq("ip_address", ip)
      .gte("created_at", since);
    if ((count ?? 0) >= 5) return { ok: false, error: "tooMany" };
  }

  const { error } = await admin.from("contact_messages").insert({
    name: d.name,
    email: d.email,
    phone: d.phone || null,
    subject: d.subject || null,
    message: d.message,
    ip_address: ip,
    user_agent: h.get("user-agent")?.slice(0, 300) ?? null,
  });

  if (error) {
    console.error("Could not save the contact message", error.message);
    return { ok: false, error: "generic" };
  }
  return { ok: true };
}