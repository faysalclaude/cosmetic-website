import { requireAdmin } from "@/lib/auth";
import { getAdminCategories } from "@/lib/data/admin-products";
import CategoryManager from "@/components/admin/CategoryManager";

export default async function AdminCategoriesPage() {
  await requireAdmin("/admin/categories");
  const categories = await getAdminCategories();

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold">Categories</h1>
      <p className="mt-1 mb-6 text-sm text-muted">
        Customers can browse products category by category. A category with products cannot be deleted.
      </p>
      <CategoryManager
        categories={categories.map((c) => ({
          id: c.id,
          nameKo: c.name_ko,
          nameEn: c.name_en,
          descKo: c.description_ko ?? "",
          descEn: c.description_en ?? "",
          sortOrder: c.sort_order,
          productCount: c.productCount,
        }))}
      />
    </div>
  );
}