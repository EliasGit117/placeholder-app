-- AlterEnum
BEGIN;
CREATE TYPE "image_purpose_new" AS ENUM ('GALLERY_SECTION_IMAGE', 'AVATAR_IMAGE', 'PRODUCT_VARIANT_IMAGE', 'BANNER_IMAGE');
ALTER TABLE "images" ALTER COLUMN "purpose" TYPE "image_purpose_new" USING ("purpose"::text::"image_purpose_new");
ALTER TYPE "image_purpose" RENAME TO "image_purpose_old";
ALTER TYPE "image_purpose_new" RENAME TO "image_purpose";
DROP TYPE "public"."image_purpose_old";
COMMIT;

