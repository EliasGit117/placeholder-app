-- CreateEnum
CREATE TYPE "gallery_section_state" AS ENUM ('active', 'hidden');

-- CreateTable
CREATE TABLE "gallery_sections" (
    "id" SERIAL NOT NULL,
    "name_ro" TEXT NOT NULL,
    "name_ru" TEXT NOT NULL,
    "description_ro" TEXT,
    "description_ru" TEXT,
    "state" "gallery_section_state" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gallery_sections_pkey" PRIMARY KEY ("id")
);
