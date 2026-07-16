import { seedCurrencies } from "../lib/services/currency-seed";

async function main() {
  console.log("Seeding currencies and exchange rates...");

  const result = await seedCurrencies();

  console.log(result.message);

  if (!result.success) {
    process.exitCode = 1;
  }
}

main()
  .catch((error) => {
    console.error("Currency seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    const { prisma } = await import("../lib/db");
    await prisma.$disconnect();
  });
