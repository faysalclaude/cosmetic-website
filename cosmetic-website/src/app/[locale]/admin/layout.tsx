import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { requireAdmin } from "@/lib/auth";
import AdminNav from "@/components/admin/AdminNav";
import LogoutButton from "@/components/auth/LogoutButton";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireAdmin();

  return (
    <div className="min-h-screen bg-cream lg:flex">
      <aside className="border-b border-line bg-white p-5 lg:min-h-screen lg:w-64 lg:shrink-0 lg:border-r lg:border-b-0">
        <Link href="/" className="font-serif text-lg font-semibold tracking-[0.3em] text-brand-dark">
          BELLAMARU
        </Link>
        <p className="mt-1 text-xs text-muted">Admin panel</p>

        <div className="mt-6">
          <AdminNav />
        </div>

        <div className="mt-8 border-t border-line pt-4 text-xs text-muted">
          <p className="truncate">{profile.email}</p>
          <div className="mt-2 flex gap-4">
            <Link href="/" className="underline">View site</Link>
            <LogoutButton className="underline" />
          </div>
        </div>
      </aside>

      <main className="min-w-0 flex-1 p-6 lg:p-10">{children}</main>
    </div>
  );
}