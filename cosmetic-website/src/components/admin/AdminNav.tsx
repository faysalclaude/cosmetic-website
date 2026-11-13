"use client";

import { Link, usePathname } from "@/i18n/navigation";

const items = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/login-logs", label: "Login logs" },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      {items.map((i) => {
        const active = i.href === "/admin" ? pathname === "/admin" : pathname.startsWith(i.href);
        return (
          <Link
            key={i.href}
            href={i.href}
            className={`block rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
              active ? "bg-brand text-white" : "hover:bg-cream"
            }`}
          >
            {i.label}
          </Link>
        );
      })}
        {["Orders"].map((label) => (
        <span
          key={label}
          className="flex items-center justify-between rounded-xl px-4 py-2.5 text-sm text-muted/60"
        >
          {label}
          <span className="rounded-full bg-cream px-2 py-0.5 text-[10px]">soon</span>
        </span>
      ))}
    </nav>
  );
}