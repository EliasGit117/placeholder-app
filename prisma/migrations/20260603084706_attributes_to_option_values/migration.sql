/*
  Warnings:

  - You are about to drop the column `attributes` on the `product_variants` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "product_variants_attributes_idx";

-- AlterTable
ALTER TABLE "product_variants" DROP COLUMN "attributes",
ADD COLUMN     "option_values" JSONB NOT NULL DEFAULT '{}';

-- CreateIndex
CREATE INDEX "product_variants_option_values_idx" ON "product_variants" USING GIN ("option_values" jsonb_ops);
