/*
  Warnings:

  - Made the column `slug` on table `product_variants` required. This step will fail if there are existing NULL values in that column.
  - Made the column `name_ro` on table `product_variants` required. This step will fail if there are existing NULL values in that column.
  - Made the column `name_ru` on table `product_variants` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "product_variants" ALTER COLUMN "slug" SET NOT NULL,
ALTER COLUMN "name_ro" SET NOT NULL,
ALTER COLUMN "name_ru" SET NOT NULL;
