/*
  Warnings:

  - You are about to drop the column `deleted_at` on the `product_variants` table. All the data in the column will be lost.
  - You are about to drop the column `deleted_at` on the `products` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "product_variants_deleted_at_idx";

-- DropIndex
DROP INDEX "products_deleted_at_idx";

-- AlterTable
ALTER TABLE "product_variants" DROP COLUMN "deleted_at",
ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "products" DROP COLUMN "deleted_at",
ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "product_variants_is_deleted_idx" ON "product_variants"("is_deleted");

-- CreateIndex
CREATE INDEX "products_is_deleted_idx" ON "products"("is_deleted");
