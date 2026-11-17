import type { MetadataRoute } from "next";
import { getCategories } from "@/lib/data/categories";
import { getProducts } from "@/lib/data/products";
import { getPublishedPosts } from "@/lib/data/blog";

export const revalidate = 3600;

const BASE = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

// one entry per language, each pointing at its other-language version
function entries(path: string, lastModified?: Date): MetadataRoute.Sitemap {
  const suffix = path === "/" ? "" : path;
  const ko = `${BASE}${suffix}`;
  const en = `${BASE}/en${suffix}`;
  const alternates = { languages: { ko, en } };
  return [
    { url: ko, lastModified, alternates },
    { url: en, lastModified, alternates },
  ];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories, posts] = await Promise.all([
    getProducts(),
    getCategories(),
    getPublishedPosts(500),
  ]);

  const staticPaths = [
    "/",
    "/product-list",
    "/blog",
    "/contact-us",
    "/faq",
    "/terms-and-services",
    "/privacy-policy",
    "/return-and-refund",
    "/shop-by-country",
  ];

  return [
    ...staticPaths.flatMap((p) => entries(p)),
    ...categories.flatMap((c) => entries(`/category/${c.id}`)),
    ...products.flatMap((p) => entries(`/product/${p.slug}`)),
    ...posts.flatMap((p) =>
      entries(`/blog/${p.slug}`, p.publishedAt ? new Date(p.publishedAt) : undefined),
    ),
  ];
}