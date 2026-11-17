import type { MetadataRoute } from "next";

const BASE = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

const PRIVATE = [
  "/admin",
  "/api",
  "/checkout",
  "/my-page",
  "/orders",
  "/payment",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [...PRIVATE, ...PRIVATE.map((p) => `/en${p}`)],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
  };
}