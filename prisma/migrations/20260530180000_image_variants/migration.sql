/*
  Warnings:

  - The values [BASE,THUMB_256x256,THUMB_512x512] on the enum `image_purpose` are replaced
    by [GALLERY_SECTION_IMAGE,AVATAR_IMAGE].
  - Existing image rows are disposable and are dropped so the enum can be replaced; images
    must be re-uploaded (originals + variants are regenerated on upload).

*/
-- Reset disposable image data before changing the purpose enum
TRUNCATE TABLE "images" RESTART IDENTITY CASCADE;

-- AlterEnum
BEGIN;
CREATE TYPE "image_purpose_new" AS ENUM ('GALLERY_SECTION_IMAGE', 'AVATAR_IMAGE');
ALTER TABLE "images" ALTER COLUMN "purpose" TYPE "image_purpose_new" USING ("purpose"::text::"image_purpose_new");
ALTER TYPE "image_purpose" RENAME TO "image_purpose_old";
ALTER TYPE "image_purpose_new" RENAME TO "image_purpose";
DROP TYPE "public"."image_purpose_old";
COMMIT;

-- CreateEnum
CREATE TYPE "image_variant_kind" AS ENUM ('THUMB_512x512', 'THUMB_256x256');

-- CreateTable
CREATE TABLE "image_variants" (
    "id" SERIAL NOT NULL,
    "image_id" INTEGER NOT NULL,
    "kind" "image_variant_kind" NOT NULL,
    "url" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "image_variants_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "image_variants_image_id_kind_key" ON "image_variants"("image_id", "kind");

-- AddForeignKey
ALTER TABLE "image_variants" ADD CONSTRAINT "image_variants_image_id_fkey" FOREIGN KEY ("image_id") REFERENCES "images"("id") ON DELETE CASCADE ON UPDATE CASCADE;
