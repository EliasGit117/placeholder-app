/*
  Warnings:

  - The values [BANNER_MOBILE_IMAGE,BANNER_TABLET_IMAGE,BANNER_DESKTOP_IMAGE] on the enum `image_purpose` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `description_ro` on the `banners` table. All the data in the column will be lost.
  - You are about to drop the column `description_ru` on the `banners` table. All the data in the column will be lost.
  - You are about to drop the column `desktop_style` on the `banners` table. All the data in the column will be lost.
  - You are about to drop the column `desktop_x_align` on the `banners` table. All the data in the column will be lost.
  - You are about to drop the column `desktop_y_align` on the `banners` table. All the data in the column will be lost.
  - You are about to drop the column `mobile_style` on the `banners` table. All the data in the column will be lost.
  - You are about to drop the column `mobile_x_align` on the `banners` table. All the data in the column will be lost.
  - You are about to drop the column `mobile_y_align` on the `banners` table. All the data in the column will be lost.
  - You are about to drop the column `tablet_style` on the `banners` table. All the data in the column will be lost.
  - You are about to drop the column `tablet_x_align` on the `banners` table. All the data in the column will be lost.
  - You are about to drop the column `tablet_y_align` on the `banners` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "image_purpose_new" AS ENUM ('GALLERY_SECTION_IMAGE', 'AVATAR_IMAGE', 'PRODUCT_VARIANT_IMAGE', 'BANNER_COMPACT_IMAGE', 'BANNER_WIDE_IMAGE');
ALTER TABLE "images" ALTER COLUMN "purpose" TYPE "image_purpose_new" USING ("purpose"::text::"image_purpose_new");
ALTER TYPE "image_purpose" RENAME TO "image_purpose_old";
ALTER TYPE "image_purpose_new" RENAME TO "image_purpose";
DROP TYPE "public"."image_purpose_old";
COMMIT;

-- AlterTable
ALTER TABLE "banners" DROP COLUMN "description_ro",
DROP COLUMN "description_ru",
DROP COLUMN "desktop_style",
DROP COLUMN "desktop_x_align",
DROP COLUMN "desktop_y_align",
DROP COLUMN "mobile_style",
DROP COLUMN "mobile_x_align",
DROP COLUMN "mobile_y_align",
DROP COLUMN "tablet_style",
DROP COLUMN "tablet_x_align",
DROP COLUMN "tablet_y_align";

-- DropEnum
DROP TYPE "banner_style";

-- DropEnum
DROP TYPE "banner_x_align";

-- DropEnum
DROP TYPE "banner_y_align";
