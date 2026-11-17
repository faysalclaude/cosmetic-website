import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getAdminSitePage } from "@/lib/data/admin-content";
import PageForm from "@/components/admin/PageForm";

type Params = Promise<{ slug: string }>;

export default async function EditSitePage({ params }: { params: Params }) {
  const { slug } = await params;
  await requireAdmin(`/admin/pages/${slug}`);
  if (!/^[a-z0-9-]{2,60}$/.test(slug)) notFound();

  const page = await getAdminSitePage(slug);
  if (!page) notFound();

  const initial = {
    titleKo: page.title_ko,
    titleEn: page.title_en,
    contentKo: page.content_ko,
    contentEn: page.content_en,
  };

  return (
    <div className="max-w-4xl">
      <h1 className="mb-6 text-2xl font-bold">Edit: {page.title_en}</h1>
      {/* key: remounts the form with fresh values after every save */}
      <PageForm
        key={JSON.stringify(initial)}
        slug={slug}
        initial={initial}
        isFaq={slug === "faq"}
      />
    </div>
  );
}