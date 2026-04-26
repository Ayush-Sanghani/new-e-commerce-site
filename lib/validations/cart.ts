import { z } from "zod";

export const addCartItemBodySchema = z.object({
  productId: z.string().min(1),
  quantity: z.coerce.number().int().min(1),
});

export type AddCartItemBody = z.infer<typeof addCartItemBodySchema>;
