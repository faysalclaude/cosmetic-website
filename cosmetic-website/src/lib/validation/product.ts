import { z } from "zod";

const digits = (label: string) =>
  z
    .string()
    .trim()
    .regex(/^\d{1,9}$/, `${label} must be a whole number (digits only)`)
    .transform(Number);

const optionalDigits = (label: string) =>
  z
    .string()
    .trim()
    .regex(/^\d{0,9}$/, `${label} must be a whole number (digits only)`)
    .transform((v) => (v === "" ? null : Number(v)));

const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Colour must look like #e81c68");

const lines = z
  .string()
  .transform((v) =>
    v
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 10),
  );

export const productSchema = z
  .object({
    slug: z
      .string()
      .trim()
      .min(2, "Slug is too short")
      .max(120, "Slug is too long")
      .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Slug may contain only lowercase letters, numbers and hyphens",
      ),
    categoryId: z.string().min(1, "Choose a category"),
    nameKo: z.string().trim().min(1, "Korean name is required").max(200),
    nameEn: z.string().trim().min(1, "English name is required").max(200),
    heroTagKo: z.string().trim().max(100),
    heroTagEn: z.string().trim().max(100),
    areaKo: z.string().trim().max(50),
    areaEn: z.string().trim().max(50),
    summaryKo: z.string().trim().max(2000),
    summaryEn: z.string().trim().max(2000),
    howToUseKo: z.string().trim().max(2000),
    howToUseEn: z.string().trim().max(2000),
    highlightsKo: lines,
    highlightsEn: lines,
    price: digits("Price"),
    compareAt: optionalDigits("Compare-at price"),
    stock: digits("Stock"),
    tint: hex,
    accent: hex,
    isNew: z.boolean(),
    isActive: z.boolean(),
    sortOrder: digits("Sort order"),
  })
  .refine((d) => d.compareAt === null || d.compareAt >= d.price, {
    message: "Compare-at price must be at least the price",
    path: ["compareAt"],
  });

export type ProductInput = z.infer<typeof productSchema>;