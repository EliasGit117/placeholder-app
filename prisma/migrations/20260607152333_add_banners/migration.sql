-- CreateEnum
CREATE TYPE "banner_state" AS ENUM ('active', 'hidden');

-- CreateEnum
CREATE TYPE "banner_x_align" AS ENUM ('LEFT', 'CENTER', 'RIGHT');

-- CreateEnum
CREATE TYPE "banner_y_align" AS ENUM ('TOP', 'CENTER', 'BOTTOM');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "image_purpose" ADD VALUE 'BANNER_MOBILE_IMAGE';
ALTER TYPE "image_purpose" ADD VALUE 'BANNER_TABLET_IMAGE';
ALTER TYPE "image_purpose" ADD VALUE 'BANNER_DESKTOP_IMAGE';

-- AlterEnum
ALTER TYPE "image_resource_type" ADD VALUE 'BANNER';

-- CreateTable
CREATE TABLE "banners" (
    "id" SERIAL NOT NULL,
    "order" INTEGER NOT NULL,
    "state" "banner_state" NOT NULL DEFAULT 'active',
    "title_ro" TEXT,
    "title_ru" TEXT,
    "description_ro" TEXT,
    "description_ru" TEXT,
    "href" TEXT,
    "mobile_x_align" "banner_x_align" NOT NULL DEFAULT 'LEFT',
    "mobile_y_align" "banner_y_align" NOT NULL DEFAULT 'CENTER',
    "tablet_x_align" "banner_x_align" NOT NULL DEFAULT 'LEFT',
    "tablet_y_align" "banner_y_align" NOT NULL DEFAULT 'CENTER',
    "desktop_x_align" "banner_x_align" NOT NULL DEFAULT 'LEFT',
    "desktop_y_align" "banner_y_align" NOT NULL DEFAULT 'CENTER',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "banners_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "banners_order_key" ON "banners"("order");
