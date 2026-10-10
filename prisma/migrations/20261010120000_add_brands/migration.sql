-- AlterTable
ALTER TABLE "products" ADD COLUMN     "brand_id" INTEGER;

-- CreateTable
CREATE TABLE "brands" (
    "id" SERIAL NOT NULL,
    "name_ro" TEXT NOT NULL,
    "name_ru" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "brands_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "brands_name_ro_key" ON "brands"("name_ro");

-- CreateIndex
CREATE UNIQUE INDEX "brands_name_ru_key" ON "brands"("name_ru");

-- CreateIndex
CREATE INDEX "products_brand_id_idx" ON "products"("brand_id");

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "brands"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
