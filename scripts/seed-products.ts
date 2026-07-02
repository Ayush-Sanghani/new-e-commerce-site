import { seedPharmaCatalog } from "../lib/services/product-seed";

async function main() {
  console.log("Seeding pharma catalog...");

  const result = await seedPharmaCatalog();

  console.log(result.message);
  if (result.errors?.length) {
    for (const error of result.errors) {
      console.error(`- ${error}`);
    }
  }

  if (!result.success) {
    process.exitCode = 1;
  }
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    const { prisma } = await import("../lib/db");
    await prisma.$disconnect();
  });
