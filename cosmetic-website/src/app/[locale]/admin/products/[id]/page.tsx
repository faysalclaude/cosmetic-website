import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { requireAdmin } from "@/lib/auth";
import {
  getAdminImages,
  getAdminProduct,
  getAdminShowcase,
  getCategoryOptions,
  toFormValues,
} from "@/lib/data/admin-products";
import ProductForm from "@/components/admin/ProductForm";
import ProductImages from "@/components/admin/ProductImages";
import ProductStudio from "@/components/admin/ProductStudio";

type Params = Promise<{ id: string }>;

export default async function EditProductPage({ params }: { params: Params }) {
  const { id } = await params;
  await requireAdmin(`/admin/products/${id}`);
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const [row, categories, images, showcase] = await Promise.all([
    getAdminProduct(id),
    getCategoryOptions(),
    getAdminImages(id),
    getAdminShowcase(id),
  ]);
  if (!row) notFound();

  const initial = toFormValues(row);

  return (
    <div className="max-w-5xl">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Edit: {row.name_en}</h1>
        <Link
          href={`/product/${row.slug}`}
          target="_blank"
          className="text-sm text-brand underline"
        >
          View on website
        </Link>
      </div>

      <nav className="mb-8 flex gap-5 text-sm font-medium">
        <a href="#details" className="hover:text-brand">Details</a>
        <a href="#images" className="hover:text-brand">Images</a>
        <a href="#studio" className="hover:text-brand">Animation studio</a>
      </nav>

      <section id="details" className="scroll-mt-6">
        {/* key: remounts the form with fresh values after every save */}
        <ProductForm
          key={JSON.stringify(initial)}
          id={row.id}
          initial={initial}
          categories={categories}
        />
      </section>

      <section id="images" className="mt-10 scroll-mt-6 rounded-2xl border border-line bg-white p-6">
        <h2 className="mb-1 text-base font-semibold">Images</h2>
        <p className="mb-5 text-sm text-muted">
          Real product photos. Upload, reorder, choose the main image.
        </p>
        <ProductImages
          productId={row.id}
          images={images.map((i) => ({ id: i.id, url: i.url }))}
        />
      </section>

      <section id="studio" className="mt-10 scroll-mt-6 rounded-2xl border border-line bg-white p-6">
        <h2 className="mb-1 text-base font-semibold">Animation studio</h2>
        <p className="mb-5 text-sm text-muted">
          Upload one photo. The background is removed, the colours are matched to the
          product, and an animation is built automatically. Check the preview, then approve.
        </p>
        <ProductStudio
          productId={row.id}
          nameKo={row.name_ko}
          nameEn={row.name_en}
          productTint={row.tint}
          productAccent={row.accent}
          existing={
            showcase
              ? {
                  imageUrl: showcase.image_url,
                  accent: showcase.accent ?? row.accent,
                  soft: showcase.soft ?? row.tint,
                  deep: showcase.deep ?? "#4a0a25",
                  isApproved: showcase.is_approved,
                }
              : null
          }
        />
      </section>
    </div>
  );
}