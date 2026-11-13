export const BUCKET = "product-images";

// ".../object/public/product-images/products/ID/file.webp" -> "products/ID/file.webp"
export function pathFromPublicUrl(url: string): string | null {
  const marker = `/object/public/${BUCKET}/`;
  const i = url.indexOf(marker);
  if (i === -1) return null;
  return decodeURIComponent(url.slice(i + marker.length).split("?")[0]);
}