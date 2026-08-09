-- AlterTable
ALTER TABLE "product_variants" ALTER COLUMN "slug" DROP NOT NULL,
ALTER COLUMN "name_ro" DROP NOT NULL,
ALTER COLUMN "name_ru" DROP NOT NULL;
