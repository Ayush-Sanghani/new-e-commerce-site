import { z } from "zod";

const optionalUrl = z.union([z.string().url(), z.literal("")]).optional().nullable();

const productFields = z.object({
  title: z.string().min(1).max(500),
  description: z.string().max(10000).optional().nullable(),
  categoryId: z.string().min(1).optional(),
  categorySlug: z.string().min(1).optional(),
  brandId: z.string().min(1).optional().nullable(),
  price: z.coerce.number().nonnegative(),
  sku: z.string().min(1).max(120),
  discountPercentage: z.coerce.number().min(0).max(100).optional().default(0),
  stock: z.coerce.number().int().min(0).optional().default(0),
  weight: z.coerce.number().nonnegative().optional().nullable(),
  width: z.coerce.number().nonnegative().optional().nullable(),
  height: z.coerce.number().nonnegative().optional().nullable(),
  depth: z.coerce.number().nonnegative().optional().nullable(),
  shippingInformation: z.string().max(2000).optional().nullable(),
  availabilityStatus: z.string().min(1).max(200).optional().default("In Stock"),
  returnPolicy: z.string().max(2000).optional().nullable(),
  thumbnail: optionalUrl,
  images: z.array(z.string().min(1)).optional().default([]),
  tags: z.array(z.string().min(1).max(100)).optional().default([]),
  keyFeatures: z.array(z.string()).optional().nullable(),
  keyBenefits: z.array(z.string()).optional().nullable(),
  directionsForUse: z.string().max(5000).optional().nullable(),
  safetyInformation: z.string().max(5000).optional().nullable(),
  usesIndications: z.string().max(5000).optional().nullable(),
  packSize: z.string().max(200).optional().nullable(),
  manufacturer: z.string().max(500).optional().nullable(),
  isSterile: z.boolean().optional().default(false),
  isSingleUse: z.boolean().optional().default(false),
  storageConditions: z.string().max(2000).optional().nullable(),
});

export const createProductBodySchema = productFields.superRefine((data, ctx) => {
  if (!data.categoryId && !data.categorySlug) {
    ctx.addIssue({
      code: "custom",
      message: "Provide categoryId or categorySlug.",
      path: ["categoryId"],
    });
  }
});

export type CreateProductBody = z.infer<typeof productFields>;

export const updateProductBodySchema = productFields.partial().superRefine((data, ctx) => {
  const provided = Object.entries(data).filter(([, v]) => v !== undefined);
  if (provided.length === 0) {
    ctx.addIssue({
      code: "custom",
      message: "At least one field is required to update.",
      path: ["title"],
    });
  }
});

export type UpdateProductBody = z.infer<typeof updateProductBodySchema>;
