-- AlterEnum
ALTER TYPE "product_state" ADD VALUE 'archived';

-- DropIndex
DROP INDEX "product_variants_is_deleted_idx";

-- DropIndex
DROP INDEX "products_is_deleted_idx";

-- AlterTable
ALTER TABLE "product_variants" DROP COLUMN "is_deleted";

-- AlterTable
ALTER TABLE "products" DROP COLUMN "is_deleted";
