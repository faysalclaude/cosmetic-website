import { requireAdmin } from "@/lib/auth";
import { getCategoryOptions } from "@/lib/data/admin-products";
import ProductForm from "@/components/admin/ProductForm";

export default async function NewProductPage() {
  await requireAdmin("/admin/products/new");
  const categories = await getCategoryOptions();

  return (
    <div className="max-w-4xl">
      <h1 className="mb-6 text-2xl font-bold">New product</h1>
      <ProductForm categories={categories} />
    </div>
  );
}