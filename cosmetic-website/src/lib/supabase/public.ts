import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Add them to .env.local (and to Vercel).",
  );
}

if (!/^https:\/\/[a-z0-9]+\.supabase\.co\/?$/.test(url)) {
  throw new Error(
    "NEXT_PUBLIC_SUPABASE_URL must look like https://<project-ref>.supabase.co (the API URL, not the dashboard link).",
  );
}

// Cookie-less client for public, read-only data (safe because of Row Level Security).
export const supabasePublic = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});