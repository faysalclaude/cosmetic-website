import { Suspense } from "react";
import ProductListView from "@/components/product/ProductListView";

export default function ProductListPage() {
  return (
    <Suspense fallback={null}>
      <ProductListView />
    </Suspense>
  );
}