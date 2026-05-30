-- AlterTable
ALTER TABLE "images" ADD COLUMN "name" TEXT NOT NULL DEFAULT '';
ALTER TABLE "images" ALTER COLUMN "name" DROP DEFAULT;

-- AlterTable
ALTER TABLE "image_variants" ADD COLUMN "name" TEXT NOT NULL DEFAULT '';
ALTER TABLE "image_variants" ALTER COLUMN "name" DROP DEFAULT;
