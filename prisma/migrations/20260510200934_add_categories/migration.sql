-- CreateEnum
CREATE TYPE "CategoryState" AS ENUM ('active', 'hidden');

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "name_ro" TEXT NOT NULL,
    "name_ru" TEXT NOT NULL,
    "description_ro" TEXT,
    "description_ru" TEXT,
    "state" "CategoryState" NOT NULL DEFAULT 'active',
    "slug" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "parent_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "categories_path_key" ON "categories"("path");

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_parent_id_key" ON "categories"("slug", "parent_id");

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
