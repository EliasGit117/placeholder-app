/*
  Warnings:

  - The values [BANNER_IMAGE,BANNER_IMAGE_MOBILE] on the enum `image_purpose` will be removed. If these variants are still used in the database, this will fail.
  - A unique constraint covering the columns `[generated_id]` on the table `image_variants` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[generated_id]` on the table `images` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "image_purpose_new" AS ENUM ('GALLERY_SECTION_IMAGE', 'AVATAR_IMAGE', 'PRODUCT_VARIANT_IMAGE', 'BANNER_IMAGE_RO', 'BANNER_IMAGE_MOBILE_RO', 'BANNER_IMAGE_RU', 'BANNER_IMAGE_MOBILE_RU');
ALTER TABLE "images" ALTER COLUMN "purpose" TYPE "image_purpose_new" USING ("purpose"::text::"image_purpose_new");
ALTER TYPE "image_purpose" RENAME TO "image_purpose_old";
ALTER TYPE "image_purpose_new" RENAME TO "image_purpose";
DROP TYPE "public"."image_purpose_old";
COMMIT;

-- AlterTable
ALTER TABLE "image_variants" ADD COLUMN     "generated_id" TEXT;

-- AlterTable
ALTER TABLE "images" ADD COLUMN     "generated_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "image_variants_generated_id_key" ON "image_variants"("generated_id");

-- CreateIndex
CREATE UNIQUE INDEX "images_generated_id_key" ON "images"("generated_id");
