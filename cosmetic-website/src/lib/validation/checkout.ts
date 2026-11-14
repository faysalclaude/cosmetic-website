import { z } from "zod";

// Messages are error codes; the checkout UI translates them (Checkout.errors.*).
export const checkoutSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().uuid("cartEmpty"),
        qty: z.number().int().min(1, "cartEmpty").max(99, "cartEmpty"),
      }),
    )
    .min(1, "cartEmpty")
    .max(30, "cartEmpty"),
  method: z.enum(["bank_transfer", "toss", "kakao", "naver", "card"]),
  recipient: z.string().trim().min(2, "invalidName").max(40, "invalidName"),
  phone: z.string().trim().regex(/^[0-9+\-\s]{9,20}$/, "invalidPhone"),
  postcode: z.string().trim().regex(/^\d{5}$/, "invalidPostcode"),
  address1: z.string().trim().min(3, "addressRequired").max(200, "addressRequired"),
  address2: z.string().trim().max(100, "addressTooLong"),
  memo: z.string().trim().max(200, "memoTooLong"),
  depositor: z.string().trim().max(40, "invalidName"),
  agree: z.boolean().refine((v) => v === true, { message: "mustAgree" }),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;