import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { Link, redirect } from "@/i18n/navigation";
import { getCurrentProfile } from "@/lib/auth";
import ProfileForm from "@/components/auth/ProfileForm";
import LogoutButton from "@/components/auth/LogoutButton";

export const metadata: Metadata = {
  title: "My Page",
  robots: { index: false, follow: false },
};

export default async function MyPage() {
  const t = await getTranslations("MyPage");
  const profile = await getCurrentProfile();

  if (!profile) {
    const locale = await getLocale();
    return redirect({ href: "/login?next=/my-page", locale });
  }

  return (
    <div className="container-page py-12">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <div className="flex items-center gap-3">
          {profile.role === "admin" && (
            <Link
              href="/admin"
              className="rounded-full border border-ink px-5 py-2 text-sm font-medium hover:bg-ink hover:text-white"
            >
              {t("adminLink")}
            </Link>
          )}
          <LogoutButton className="rounded-full border border-line px-5 py-2 text-sm font-medium hover:border-brand hover:text-brand" />
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <section className="rounded-3xl border border-line bg-white p-8">
          <h2 className="mb-6 text-lg font-semibold">{t("profile")}</h2>
          <ProfileForm
            email={profile.email ?? ""}
            fullName={profile.full_name ?? ""}
            phone={profile.phone ?? ""}
          />
        </section>

        <section className="rounded-3xl border border-line bg-white p-8">
          <h2 className="mb-6 text-lg font-semibold">{t("orders")}</h2>
          <p className="text-sm text-muted">{t("noOrders")}</p>
        </section>
      </div>
    </div>
  );
}