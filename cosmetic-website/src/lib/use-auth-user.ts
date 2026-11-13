"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/browser";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
};

type State = { user: AuthUser | null; loading: boolean };

export function useAuthUser(): State {
  const [state, setState] = useState<State>({ user: null, loading: true });

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    async function load() {
      const { data } = await supabase.auth.getUser();
      const u = data.user;
      if (!u) {
        if (active) setState({ user: null, loading: false });
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, role")
        .eq("id", u.id)
        .maybeSingle();

      if (active) {
        setState({
          loading: false,
          user: {
            id: u.id,
            email: u.email ?? "",
            name: profile?.full_name || u.email?.split("@")[0] || "",
            isAdmin: profile?.role === "admin",
          },
        });
      }
    }

    void load();
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      // defer: do not call Supabase from inside its own auth callback
      setTimeout(() => void load(), 0);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return state;
}