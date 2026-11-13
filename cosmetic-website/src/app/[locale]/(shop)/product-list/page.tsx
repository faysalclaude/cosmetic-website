import { Suspense } from "react";
import ProductListView from "@/components/product/ProductListView";
import { getProducts } from "@/lib/data/products";

export const revalidate = 60;

export default async function ProductListPage() {
  const products = await getProducts();
  return (
    <Suspense fallback={null}>
      <ProductListView products={products} />
    </Suspense>
  );
}