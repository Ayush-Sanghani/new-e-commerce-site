import { z } from "zod";

const optionalTrimmed = z
  .string()
  .trim()
  .min(1)
  .max(120)
  .optional()
  .or(z.literal(""));

export const updateProfileBodySchema = z
  .object({
    name: z.string().trim().min(1).max(120).optional(),
    email: z.string().email().optional(),
    phone: z
      .string()
      .trim()
      .regex(/^[0-9+\-() ]{7,20}$/, "Invalid phone number format.")
      .optional(),
    addressLine1: optionalTrimmed,
    addressLine2: optionalTrimmed,
    city: optionalTrimmed,
    state: optionalTrimmed,
    postalCode: optionalTrimmed,
    country: optionalTrimmed,
  })
  .strict();

export type UpdateProfileBody = z.infer<typeof updateProfileBodySchema>;
