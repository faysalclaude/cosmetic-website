"use client";

import { Link, usePathname } from "@/i18n/navigation";

const items = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/categories", label: "Categories" },
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
        
      
    </nav>
  );
}