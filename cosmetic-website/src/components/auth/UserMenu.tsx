"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { User } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useAuthUser } from "@/lib/use-auth-user";
import LogoutButton from "./LogoutButton";

export default function UserMenu() {
  const t = useTranslations();
  const { user, loading } = useAuthUser();
  const [open, setOpen] = useState(false);

  if (loading || !user) {
    return (
      <Link
        href="/login"
        className="flex items-center gap-1 text-sm font-medium hover:text-brand"
        aria-label={t("Common.login")}
      >
        <User size={22} />
        <span className="hidden lg:inline">{t("Common.login")}</span>
      </Link>
    );
  }

  const item = "block rounded-xl px-4 py-2.5 text-left text-sm hover:bg-cream";

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 text-sm font-medium hover:text-brand"
        aria-expanded={open}
      >
        <User size={22} />
        <span className="hidden max-w-24 truncate lg:inline">{user.name}</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-50 mt-3 w-52 rounded-2xl border border-line bg-white p-2 shadow-xl">
            <p className="truncate px-4 py-2 text-xs text-muted">{user.email}</p>
            <Link href="/my-page" onClick={() => setOpen(false)} className={item}>
              {t("Auth.myPage")}
            </Link>
            {user.isAdmin && (
              <Link href="/admin" onClick={() => setOpen(false)} className={item}>
                {t("Auth.admin")}
              </Link>
            )}
            <LogoutButton className={`${item} w-full`} />
          </div>
        </>
      )}
    </div>
  );
}