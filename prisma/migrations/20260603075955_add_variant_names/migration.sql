/*
  Warnings:

  - Added the required column `name_ro` to the `product_variants` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name_ru` to the `product_variants` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "product_variants" ADD COLUMN     "name_ro" TEXT NOT NULL,
ADD COLUMN     "name_ru" TEXT NOT NULL;
