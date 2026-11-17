import type { Metadata } from "next";

export function pageMetadata(opts: {
  locale: string;
  path: string;
  title: string;
  description: string;
}): Metadata {
  const { locale, path, title, description } = opts;
  return {
    title,
    description,
    alternates: {
      canonical: locale === "en" ? `/en${path}` : path,
        languages: { ko: path, en: `/en${path}`, "x-default": path },
    },
    openGraph: {
      title,
      description,
      type: "website",
      locale: locale === "en" ? "en_US" : "ko_KR",
    },
  };
}

// Turns Markdown into plain text (for descriptions and structured data).
export function stripMarkdown(md: string): string {
  return md
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^>\s?/gm, "")
    .replace(/[#*_`>]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}