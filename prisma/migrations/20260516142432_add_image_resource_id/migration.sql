-- AlterTable
ALTER TABLE "images" ADD COLUMN     "resource_id" INTEGER;

-- CreateIndex
CREATE INDEX "images_resource_type_resource_id_idx" ON "images"("resource_type", "resource_id");
