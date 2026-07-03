-- AlterEnum
BEGIN;
CREATE TYPE "image_purpose_new" AS ENUM ('AVATAR_IMAGE', 'PRODUCT_VARIANT_IMAGE', 'BANNER_IMAGE_RO', 'BANNER_IMAGE_MOBILE_RO', 'BANNER_IMAGE_RU', 'BANNER_IMAGE_MOBILE_RU');
ALTER TABLE "images" ALTER COLUMN "purpose" TYPE "image_purpose_new" USING ("purpose"::text::"image_purpose_new");
ALTER TYPE "image_purpose" RENAME TO "image_purpose_old";
ALTER TYPE "image_purpose_new" RENAME TO "image_purpose";
DROP TYPE "public"."image_purpose_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "image_resource_type_new" AS ENUM ('AVATAR', 'PRODUCT_VARIANT', 'BANNER');
ALTER TABLE "images" ALTER COLUMN "resource_type" TYPE "image_resource_type_new" USING ("resource_type"::text::"image_resource_type_new");
ALTER TYPE "image_resource_type" RENAME TO "image_resource_type_old";
ALTER TYPE "image_resource_type_new" RENAME TO "image_resource_type";
DROP TYPE "public"."image_resource_type_old";
COMMIT;

-- DropTable
DROP TABLE "gallery_sections";

-- DropEnum
DROP TYPE "gallery_section_state";

