import { z } from "zod";

// Messages are error codes; the UI translates them (Auth.errors.*).
export const loginSchema = z.object({
  email: z.string().trim().email("invalidEmail"),
  password: z.string().min(1, "passwordRequired"),
});

export const registerSchema = z
  .object({
    fullName: z.string().trim().min(2, "nameShort").max(60, "nameShort"),
    email: z.string().trim().email("invalidEmail"),
    phone: z.string().trim().regex(/^$|^[0-9+\-\s]{7,20}$/, "invalidPhone"),
    password: z.string().min(8, "passwordShort").max(72, "passwordShort"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "passwordMismatch",
    path: ["confirmPassword"],
  });

export const forgotSchema = z.object({
  email: z.string().trim().email("invalidEmail"),
});

export const profileSchema = z.object({
  fullName: z.string().trim().min(2, "nameShort").max(60, "nameShort"),
  phone: z.string().trim().regex(/^$|^[0-9+\-\s]{7,20}$/, "invalidPhone"),
});

export function firstIssue(error: z.ZodError): string {
  return error.issues[0]?.message ?? "generic";
}