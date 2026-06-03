/*
  Warnings:

  - You are about to drop the column `description_ro` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `description_ru` on the `products` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "product_state" ADD VALUE 'not_available';

-- AlterTable
ALTER TABLE "product_variants" ADD COLUMN     "state" "product_state" NOT NULL DEFAULT 'active';

-- AlterTable
ALTER TABLE "products" DROP COLUMN "description_ro",
DROP COLUMN "description_ru",
ADD COLUMN     "short_description_ro" TEXT,
ADD COLUMN     "short_description_ru" TEXT;
