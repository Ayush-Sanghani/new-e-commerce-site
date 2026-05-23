import { prisma } from "@/lib/db";
import type {
  DummyJsonProduct,
  DummyJsonProductsResponse,
} from "@/lib/types/dummyjson";

/**
 * Product.price in the database is list price in INR.
 * DummyJSON returns USD-scale numbers — avoid re-seeding production after INR conversion.
 */

const DUMMYJSON_URL = "https://dummyjson.com/products";
const LIMIT = 250;

function categoryToSlug(category: string): string {
  return category.toLowerCase().trim().replace(/\s+/g, "-");
}

function ensurePrismaModels(): void {
  if (
    typeof prisma.category?.upsert !== "function" ||
    typeof prisma.tag?.upsert !== "function"
  ) {
    throw new Error(
      "Prisma client is missing Category or Tag models. Run: npx prisma generate"
    );
  }
}

/**
 * Fetches products from DummyJSON and upserts them into the database
 * with Category, Brand, Tag, ProductImage, and Review relations.
 */
export async function seedProductsFromDummyJson(): Promise<{
  success: boolean;
  message: string;
  created: number;
  updated: number;
  errors?: string[];
}> {
  ensurePrismaModels();

  const errors: string[] = [];
  let created = 0;
  let updated = 0;

  const res = await fetch(`${DUMMYJSON_URL}?limit=${LIMIT}`);
  if (!res.ok) {
    return {
      success: false,
      message: `Failed to fetch from DummyJSON: ${res.status}`,
      created: 0,
      updated: 0,
    };
  }

  const data = (await res.json()) as DummyJsonProductsResponse;
  const products = data.products ?? [];

  if (products.length === 0) {
    return {
      success: true,
      message: "No products to seed.",
      created: 0,
      updated: 0,
    };
  }

  for (const p of products) {
    try {
      const result = await upsertOneProduct(p);
      if (result === "created") created++;
      else updated++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`SKU ${p.sku}: ${msg}`);
    }
  }

  return {
    success: errors.length === 0,
    message:
      errors.length === 0
        ? `Seeded ${created + updated} products (${created} created, ${updated} updated).`
        : `Seeded with ${errors.length} error(s).`,
    created,
    updated,
    errors: errors.length > 0 ? errors : undefined,
  };
}

async function upsertOneProduct(p: DummyJsonProduct): Promise<"created" | "updated"> {
  const slug = categoryToSlug(p.category);
  const dims = p.dimensions ?? { width: 0, height: 0, depth: 0 };

  const category = await prisma.category.upsert({
    where: { slug },
    create: { name: p.category, slug },
    update: { name: p.category },
  });

  let brandId: string | null = null;
  if (p.brand && p.brand.trim()) {
    let brand = await prisma.brand.findFirst({
      where: { name: p.brand.trim() },
    });
    if (!brand) {
      brand = await prisma.brand.create({ data: { name: p.brand.trim() } });
    }
    brandId = brand.id;
  }

  const tagIds: string[] = [];
  for (const tagName of p.tags ?? []) {
    if (!tagName?.trim()) continue;
    const tag = await prisma.tag.upsert({
      where: { name: tagName.trim() },
      create: { name: tagName.trim() },
      update: {},
    });
    tagIds.push(tag.id);
  }

  const existing = await prisma.product.findUnique({ where: { sku: p.sku } });

  const productData = {
    title: p.title,
    description: p.description ?? null,
    categoryId: category.id,
    brandId,
    price: p.price,
    discountPercentage: p.discountPercentage ?? 0,
    rating: p.rating ?? null,
    stock: p.stock ?? 0,
    sku: p.sku,
    weight: p.weight ?? null,
    width: dims.width ?? null,
    height: dims.height ?? null,
    depth: dims.depth ?? null,
    warrantyInformation: p.warrantyInformation ?? null,
    shippingInformation: p.shippingInformation ?? null,
    availabilityStatus: p.availabilityStatus ?? "In Stock",
    returnPolicy: p.returnPolicy ?? null,
    minimumOrderQuantity: 1,
    thumbnail: p.thumbnail ?? null,
    barcode: p.meta?.barcode ?? null,
    qrCode: p.meta?.qrCode ?? null,
  };

  let productId: string;

  if (existing) {
    await prisma.product.update({
      where: { id: existing.id },
      data: productData,
    });
    productId = existing.id;

    await prisma.productImage.deleteMany({ where: { productId } });
    await prisma.productTag.deleteMany({ where: { productId } });
    await prisma.review.deleteMany({ where: { productId } });
  } else {
    const product = await prisma.product.create({
      data: productData,
    });
    productId = product.id;
  }

  if ((p.images ?? []).length > 0) {
    await prisma.productImage.createMany({
      data: p.images.map((url, i) => ({
        productId,
        url,
        sortOrder: i,
      })),
    });
  }

  if (tagIds.length > 0) {
    await prisma.productTag.createMany({
      data: tagIds.map((tagId) => ({ productId, tagId })),
    });
  }

  if ((p.reviews ?? []).length > 0) {
    await prisma.review.createMany({
      data: p.reviews.map((r) => ({
        productId,
        rating: Math.min(5, Math.max(1, Math.round(r.rating))),
        comment: r.comment ?? null,
        reviewerName: r.reviewerName ?? "Anonymous",
        reviewerEmail: r.reviewerEmail ?? "",
        createdAt: r.date ? new Date(r.date) : new Date(),
      })),
    });
  }

  return existing ? "updated" : "created";
}
