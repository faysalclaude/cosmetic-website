import { Link } from "@/i18n/navigation";
import { requireAdmin } from "@/lib/auth";
import { getAdminProducts } from "@/lib/data/admin-products";
import { formatKRW } from "@/lib/utils";
import ProductRowActions from "@/components/admin/ProductRowActions";

export default async function AdminProductsPage() {
  await requireAdmin("/admin/products");
  const products = await getAdminProducts();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="mt-1 text-sm text-muted">{products.length} products</p>
        </div>
        <Link
          href="/admin/products/new"
          className="rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          + New product
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-line bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-cream text-xs text-muted uppercase">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {products.map((p) => {
              const image = [...(p.product_images ?? [])].sort(
                (a, b) => a.sort_order - b.sort_order,
              )[0]?.url;
              return (
                <tr key={p.id} className={p.is_active ? "" : "bg-cream/60"}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={image} alt="" className="h-12 w-12 rounded-lg object-contain" />
                      ) : (
                        <span
                          className="h-12 w-12 shrink-0 rounded-lg"
                          style={{ background: `linear-gradient(145deg, ${p.tint}, ${p.accent})` }}
                        />
                      )}
                      <div className="min-w-0">
                        <p className="font-medium">{p.name_en}</p>
                        <p className="text-xs text-muted">{p.name_ko}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">{p.category_id}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {formatKRW(p.price, "ko")}
                    {p.compare_at && (
                      <span className="ml-2 text-xs text-muted line-through">
                        {formatKRW(p.compare_at, "ko")}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">{p.stock}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        p.is_active ? "bg-green-100 text-green-800" : "bg-cream text-muted"
                      }`}
                    >
                      {p.is_active ? "Visible" : "Hidden"}
                    </span>
                    {p.is_new && (
                      <span className="ml-2 rounded-full bg-ink px-2 py-1 text-[10px] font-semibold text-white">
                        NEW
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <ProductRowActions id={p.id} isActive={p.is_active} name={p.name_en} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}