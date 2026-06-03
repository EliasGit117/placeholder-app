-- CreateEnum
CREATE TYPE "product_state" AS ENUM ('active', 'hidden');

-- CreateTable
CREATE TABLE "products" (
    "id" SERIAL NOT NULL,
    "name_ro" TEXT NOT NULL,
    "name_ru" TEXT NOT NULL,
    "description_ro" TEXT,
    "description_ru" TEXT,
    "state" "product_state" NOT NULL DEFAULT 'active',
    "slug" TEXT NOT NULL,
    "option_schema" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_variants" (
    "id" SERIAL NOT NULL,
    "product_id" INTEGER NOT NULL,
    "slug" TEXT NOT NULL,
    "full_slug" TEXT NOT NULL,
    "attributes" JSONB NOT NULL DEFAULT '{}',
    "price" INTEGER NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_variants_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "products_slug_key" ON "products"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "product_variants_full_slug_key" ON "product_variants"("full_slug");

-- CreateIndex
CREATE INDEX "product_variants_product_id_idx" ON "product_variants"("product_id");

-- CreateIndex
CREATE INDEX "product_variants_attributes_idx" ON "product_variants" USING GIN ("attributes" jsonb_ops);

-- CreateIndex
CREATE UNIQUE INDEX "product_variants_product_id_slug_key" ON "product_variants"("product_id", "slug");

-- AddForeignKey
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
