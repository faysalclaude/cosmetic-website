import { z } from "zod";

// Messages are error codes; the form translates them (Contact.errors.*).
export const contactSchema = z.object({
  name: z.string().trim().min(2, "invalidName").max(60, "invalidName"),
  email: z.string().trim().email("invalidEmail").max(120, "invalidEmail"),
  phone: z.string().trim().regex(/^$|^[0-9+\-\s]{7,20}$/, "invalidPhone"),
  subject: z.string().trim().max(100, "subjectTooLong"),
  message: z.string().trim().min(10, "messageShort").max(2000, "messageLong"),
  website: z.string().max(200), // hidden trap field: real people leave it empty
  agree: z.boolean().refine((v) => v === true, { message: "mustAgree" }),
});