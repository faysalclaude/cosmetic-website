"use server";

import { assertAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

type Result = { ok: true } | { ok: false; error: string };

const isUuid = (v: string) => /^[0-9a-f-]{36}$/i.test(v);

export async function setMessageReadAction(id: string, read: boolean): Promise<Result> {
  await assertAdmin();
  if (!isUuid(id)) return { ok: false, error: "Invalid message." };

  const { error } = await createAdminClient()
    .from("contact_messages")
    .update({ is_read: read })
    .eq("id", id);
  return error ? { ok: false, error: error.message.slice(0, 200) } : { ok: true };
}

export async function deleteMessageAction(id: string): Promise<Result> {
  await assertAdmin();
  if (!isUuid(id)) return { ok: false, error: "Invalid message." };

  const { error } = await createAdminClient().from("contact_messages").delete().eq("id", id);
  return error ? { ok: false, error: error.message.slice(0, 200) } : { ok: true };
}