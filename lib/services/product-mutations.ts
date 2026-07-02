import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getProductById } from "@/lib/services/product-queries";
import type { CreateProductBody, UpdateProductBody } from "@/lib/validations/product-mutation";

function emptyToNull(s: string | null | undefined): string | null | undefined {
  if (s === undefined) return undefined;
  if (s === null || s === "") return null;
  return s;
}

async function resolveCategoryId(
  categoryId: string | undefined,
  categorySlug: string | undefined
): Promise<string> {
  if (categoryId) {
    const c = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!c) throw new Error("Category not found.");
    return c.id;
  }
  if (categorySlug) {
    const c = await prisma.category.findUnique({ where: { slug: categorySlug.trim().toLowerCase() } });
    if (!c) throw new Error("Category not found for slug.");
    return c.id;
  }
  throw new Error("categoryId or categorySlug required.");
}

async function assertBrandExists(brandId: string | null | undefined): Promise<string | null> {
  if (!brandId) return null;
  const b = await prisma.brand.findUnique({ where: { id: brandId } });
  if (!b) throw new Error("Brand not found.");
  return brandId;
}

export async function createProduct(body: CreateProductBody) {
  const categoryId = await resolveCategoryId(body.categoryId, body.categorySlug);
  const brandId = await assertBrandExists(body.brandId ?? null);

  const thumbnail = emptyToNull(body.thumbnail ?? undefined) ?? null;

  try {
    const product = await prisma.$transaction(async (tx) => {
      const p = await tx.product.create({
        data: {
          title: body.title,
          description: body.description ?? null,
          categoryId,
          brandId,
          price: body.price,
          sku: body.sku.trim(),
          discountPercentage: body.discountPercentage ?? 0,
          stock: body.stock ?? 0,
          weight: body.weight ?? null,
          width: body.width ?? null,
          height: body.height ?? null,
          depth: body.depth ?? null,
          shippingInformation: body.shippingInformation ?? null,
          availabilityStatus: body.availabilityStatus ?? "In Stock",
          returnPolicy: body.returnPolicy ?? null,
          minimumOrderQuantity: 1,
          thumbnail,
          keyFeatures: body.keyFeatures ?? Prisma.JsonNull,
          keyBenefits: body.keyBenefits ?? Prisma.JsonNull,
          directionsForUse: body.directionsForUse ?? null,
          safetyInformation: body.safetyInformation ?? null,
          usesIndications: body.usesIndications ?? null,
          packSize: body.packSize ?? null,
          manufacturer: body.manufacturer ?? null,
          isSterile: body.isSterile ?? false,
          isSingleUse: body.isSingleUse ?? false,
          storageConditions: body.storageConditions ?? null,
        },
      });

      const imgs = body.images ?? [];
      if (imgs.length > 0) {
        await tx.productImage.createMany({
          data: imgs.map((url, i) => ({
            productId: p.id,
            url: url.trim(),
            sortOrder: i,
          })),
        });
      }

      const tagNames = body.tags ?? [];
      if (tagNames.length > 0) {
        for (const name of [...new Set(tagNames.map((t) => t.trim()).filter(Boolean))]) {
          const tag = await tx.tag.upsert({
            where: { name },
            create: { name },
            update: {},
          });
          await tx.productTag.create({
            data: { productId: p.id, tagId: tag.id },
          });
        }
      }

      return p;
    });

    const full = await getProductById(product.id);
    return full;
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2002") {
        throw new Error("A product with this SKU already exists.");
      }
      if (err.code === "P2003") {
        throw new Error("Invalid category or brand reference.");
      }
    }
    throw err;
  }
}

export async function updateProduct(id: string, body: UpdateProductBody) {
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) return null;

  let categoryId: string | undefined;
  if (body.categoryId !== undefined || body.categorySlug !== undefined) {
    categoryId = await resolveCategoryId(body.categoryId, body.categorySlug);
  }

  let brandId: string | null | undefined;
  if (body.brandId !== undefined) {
    brandId = body.brandId === null ? null : await assertBrandExists(body.brandId);
  }

  const data: Prisma.ProductUpdateInput = {};

  if (body.title !== undefined) data.title = body.title;
  if (body.description !== undefined) data.description = body.description;
  if (categoryId !== undefined) data.category = { connect: { id: categoryId } };
  if (brandId !== undefined) {
    data.brand = brandId ? { connect: { id: brandId } } : { disconnect: true };
  }
  if (body.price !== undefined) data.price = body.price;
  if (body.sku !== undefined) data.sku = body.sku.trim();
  if (body.discountPercentage !== undefined) data.discountPercentage = body.discountPercentage;
  if (body.stock !== undefined) data.stock = body.stock;
  if (body.weight !== undefined) data.weight = body.weight;
  if (body.width !== undefined) data.width = body.width;
  if (body.height !== undefined) data.height = body.height;
  if (body.depth !== undefined) data.depth = body.depth;
  if (body.shippingInformation !== undefined) data.shippingInformation = body.shippingInformation;
  if (body.availabilityStatus !== undefined) data.availabilityStatus = body.availabilityStatus;
  if (body.returnPolicy !== undefined) data.returnPolicy = body.returnPolicy;
  if (body.thumbnail !== undefined) data.thumbnail = emptyToNull(body.thumbnail) ?? null;
  if (body.keyFeatures !== undefined) {
    data.keyFeatures = body.keyFeatures === null ? Prisma.JsonNull : body.keyFeatures;
  }
  if (body.keyBenefits !== undefined) {
    data.keyBenefits = body.keyBenefits === null ? Prisma.JsonNull : body.keyBenefits;
  }
  if (body.directionsForUse !== undefined) data.directionsForUse = body.directionsForUse;
  if (body.safetyInformation !== undefined) data.safetyInformation = body.safetyInformation;
  if (body.usesIndications !== undefined) data.usesIndications = body.usesIndications;
  if (body.packSize !== undefined) data.packSize = body.packSize;
  if (body.manufacturer !== undefined) data.manufacturer = body.manufacturer;
  if (body.isSterile !== undefined) data.isSterile = body.isSterile;
  if (body.isSingleUse !== undefined) data.isSingleUse = body.isSingleUse;
  if (body.storageConditions !== undefined) data.storageConditions = body.storageConditions;

  try {
    await prisma.$transaction(async (tx) => {
      if (Object.keys(data).length > 0) {
        await tx.product.update({ where: { id }, data });
      }

      if (body.images !== undefined) {
        await tx.productImage.deleteMany({ where: { productId: id } });
        if (body.images.length > 0) {
          await tx.productImage.createMany({
            data: body.images.map((url, i) => ({
              productId: id,
              url: url.trim(),
              sortOrder: i,
            })),
          });
        }
      }

      if (body.tags !== undefined) {
        await tx.productTag.deleteMany({ where: { productId: id } });
        const uniqueNames = [...new Set(body.tags.map((t) => t.trim()).filter(Boolean))];
        for (const name of uniqueNames) {
          const tag = await tx.tag.upsert({
            where: { name },
            create: { name },
            update: {},
          });
          await tx.productTag.create({
            data: { productId: id, tagId: tag.id },
          });
        }
      }
    });

    return getProductById(id);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2002") {
        throw new Error("A product with this SKU already exists.");
      }
    }
    throw err;
  }
}

export async function deleteProduct(id: string): Promise<boolean> {
  try {
    await prisma.product.delete({ where: { id } });
    return true;
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
      return false;
    }
    throw err;
  }
}
