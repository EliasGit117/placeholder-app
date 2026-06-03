/*
  Warnings:

  - You are about to drop the column `stock` on the `product_variants` table. All the data in the column will be lost.
  - Added the required column `sku` to the `product_variants` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "product_variants" DROP COLUMN "stock",
ADD COLUMN     "sku" TEXT NOT NULL;
