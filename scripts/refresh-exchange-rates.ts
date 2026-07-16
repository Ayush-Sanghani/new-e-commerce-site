import { refreshExchangeRatesFromApi } from "../lib/services/exchange-rate";

async function main() {
  console.log("Refreshing exchange rates...");

  const result = await refreshExchangeRatesFromApi();

  console.log(result.message);

  if (result.updated.length > 0) {
    console.log(`Updated: ${result.updated.join(", ")}`);
  }

  if (result.skipped.length > 0) {
    console.log(`Skipped: ${result.skipped.join(", ")}`);
  }

  for (const error of result.errors) {
    console.error(`- ${error}`);
  }

  if (!result.success) {
    process.exitCode = 1;
  }
}

main()
  .catch((error) => {
    console.error("Exchange rate refresh failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    const { prisma } = await import("../lib/db");
    await prisma.$disconnect();
  });
