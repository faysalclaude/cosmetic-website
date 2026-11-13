import { Suspense } from "react";
import ProductListView from "@/components/product/ProductListView";
import { getCategories } from "@/lib/data/categories";
import { getProducts } from "@/lib/data/products";

export const revalidate = 60;

export default async function ProductListPage() {
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);
  return (
    <Suspense fallback={null}>
      <ProductListView products={products} categories={categories} />
    </Suspense>
  );
}