import { z } from "zod";

export const blogSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(2, "Slug is too short")
    .max(120, "Slug is too long")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug may contain only lowercase letters, numbers and hyphens",
    ),
  categoryKo: z.string().trim().max(40, "Category is too long"),
  categoryEn: z.string().trim().max(40, "Category is too long"),
  titleKo: z.string().trim().min(1, "Korean title is required").max(200),
  titleEn: z.string().trim().min(1, "English title is required").max(200),
  excerptKo: z.string().trim().max(300, "The summary can be at most 300 characters"),
  excerptEn: z.string().trim().max(300, "The summary can be at most 300 characters"),
  contentKo: z.string().max(50000, "The Korean text is too long"),
  contentEn: z.string().max(50000, "The English text is too long"),
  coverUrl: z.string().trim().max(600),
  isPublished: z.boolean(),
});

export type BlogInput = z.infer<typeof blogSchema>;