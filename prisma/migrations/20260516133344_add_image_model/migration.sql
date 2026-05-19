-- CreateEnum
CREATE TYPE "image_resource_type" AS ENUM ('GALLERY_SECTION', 'AVATAR');

-- CreateEnum
CREATE TYPE "image_purpose" AS ENUM ('PRIMARY', 'THUMBNAIL', 'BACKGROUND');

-- CreateTable
CREATE TABLE "images" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "mime_type" TEXT NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "thumbhash" TEXT,
    "resource_type" "image_resource_type" NOT NULL,
    "purpose" "image_purpose" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "images_pkey" PRIMARY KEY ("id")
);
