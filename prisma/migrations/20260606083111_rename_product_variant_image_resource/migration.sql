/*
  Warnings:

  - The values [PRODUCT_IMAGE] on the enum `image_purpose` will be removed. If these variants are still used in the database, this will fail.
  - The values [PRODUCT] on the enum `image_resource_type` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "image_purpose_new" AS ENUM ('GALLERY_SECTION_IMAGE', 'AVATAR_IMAGE', 'PRODUCT_VARIANT_IMAGE');
ALTER TABLE "images" ALTER COLUMN "purpose" TYPE "image_purpose_new" USING ("purpose"::text::"image_purpose_new");
ALTER TYPE "image_purpose" RENAME TO "image_purpose_old";
ALTER TYPE "image_purpose_new" RENAME TO "image_purpose";
DROP TYPE "public"."image_purpose_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "image_resource_type_new" AS ENUM ('GALLERY_SECTION', 'AVATAR', 'PRODUCT_VARIANT');
ALTER TABLE "images" ALTER COLUMN "resource_type" TYPE "image_resource_type_new" USING ("resource_type"::text::"image_resource_type_new");
ALTER TYPE "image_resource_type" RENAME TO "image_resource_type_old";
ALTER TYPE "image_resource_type_new" RENAME TO "image_resource_type";
DROP TYPE "public"."image_resource_type_old";
COMMIT;
