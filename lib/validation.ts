import { z } from "zod";
const line = z
  .object({
    variantId: z.string().min(1).max(120),
    quantity: z.number().int().min(1).max(20),
    expectedUnitPrice: z.number().int().positive(),
  })
  .strict();
export const quoteSchema = z
  .object({
    lines: z.array(line).min(1).max(50),
    country: z.string().regex(/^[A-Z]{2}$/),
  })
  .strict();
export const checkoutSchema = quoteSchema
  .extend({
    email: z.email().max(254),
    name: z.string().trim().min(2).max(100),
    phone: z
      .string()
      .trim()
      .regex(
        /^\+?[\d\s()\-]{7,25}$/,
        "Enter a phone number with your country code.",
      ),
    address: z.string().trim().min(5).max(250),
    address2: z.string().trim().max(250).default(""),
    city: z.string().trim().min(2).max(100),
    region: z.string().trim().max(100).default(""),
    postalCode: z.string().trim().max(20).default(""),
    consent: z.literal(true, {
      error: "Please acknowledge the shipping and currency information.",
    }),
    idempotencyKey: z.uuid(),
    captcha: z.string().max(4096).default(""),
  })
  .strict();
export const enquirySchema = z
  .object({
    name: z.string().trim().min(2).max(100),
    email: z.email().max(254),
    country: z.string().trim().min(2).max(80),
    phone: z.string().trim().max(30).default(""),
    style: z.string().trim().min(2).max(100),
    length: z.string().max(30),
    colour: z.string().trim().max(100),
    quantity: z.coerce.number().int().min(1).max(2000),
    notes: z.string().trim().min(10).max(3000),
    website: z.string().max(0).default(""),
  })
  .strict();
export type CheckoutInput = z.infer<typeof checkoutSchema>;
