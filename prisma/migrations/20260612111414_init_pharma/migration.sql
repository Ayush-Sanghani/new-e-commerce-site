/*
  Warnings:

  - You are about to drop the column `barcode` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `qrCode` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `rating` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `warrantyInformation` on the `Product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Product" DROP COLUMN "barcode",
DROP COLUMN "qrCode",
DROP COLUMN "rating",
DROP COLUMN "warrantyInformation",
ADD COLUMN     "directionsForUse" TEXT,
ADD COLUMN     "isSingleUse" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isSterile" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "keyBenefits" JSONB,
ADD COLUMN     "keyFeatures" JSONB,
ADD COLUMN     "manufacturer" TEXT,
ADD COLUMN     "packSize" TEXT,
ADD COLUMN     "safetyInformation" TEXT,
ADD COLUMN     "storageConditions" TEXT,
ADD COLUMN     "usesIndications" TEXT;
