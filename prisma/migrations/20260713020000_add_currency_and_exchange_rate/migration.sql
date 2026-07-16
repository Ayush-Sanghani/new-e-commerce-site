-- AlterTable: UserProfile.preferredCurrency
ALTER TABLE "UserProfile" ADD COLUMN "preferredCurrency" TEXT;

-- CreateTable: Currency
CREATE TABLE "Currency" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "decimalDigits" INTEGER NOT NULL DEFAULT 2,
    "isRazorpaySupported" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Currency_pkey" PRIMARY KEY ("id")
);

-- CreateTable: ExchangeRate
CREATE TABLE "ExchangeRate" (
    "id" TEXT NOT NULL,
    "currencyId" TEXT NOT NULL,
    "rateToInr" DECIMAL(15,6) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExchangeRate_pkey" PRIMARY KEY ("id")
);

-- AlterTable: Order — add FX fields (nullable first for backfill)
ALTER TABLE "Order" ADD COLUMN "exchangeRate" DECIMAL(15,6) NOT NULL DEFAULT 1;
ALTER TABLE "Order" ADD COLUMN "totalInInr" DECIMAL(10,2);

-- Backfill existing orders (Q5a)
UPDATE "Order" SET "totalInInr" = "total" WHERE "totalInInr" IS NULL;
UPDATE "Order" SET "exchangeRate" = 1 WHERE "exchangeRate" IS NULL;

ALTER TABLE "Order" ALTER COLUMN "totalInInr" SET NOT NULL;

-- AlterTable: Payment — add FX fields
ALTER TABLE "Payment" ADD COLUMN "exchangeRate" DECIMAL(15,6) NOT NULL DEFAULT 1;
ALTER TABLE "Payment" ADD COLUMN "amountInInr" DECIMAL(10,2);

-- Backfill existing payments (Q5a)
UPDATE "Payment" SET "amountInInr" = "amount" WHERE "amountInInr" IS NULL;
UPDATE "Payment" SET "exchangeRate" = 1 WHERE "exchangeRate" IS NULL;

ALTER TABLE "Payment" ALTER COLUMN "amountInInr" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Currency_code_key" ON "Currency"("code");
CREATE INDEX "Currency_isActive_idx" ON "Currency"("isActive");
CREATE UNIQUE INDEX "ExchangeRate_currencyId_key" ON "ExchangeRate"("currencyId");

-- AddForeignKey
ALTER TABLE "ExchangeRate" ADD CONSTRAINT "ExchangeRate_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "Currency"("id") ON DELETE CASCADE ON UPDATE CASCADE;
