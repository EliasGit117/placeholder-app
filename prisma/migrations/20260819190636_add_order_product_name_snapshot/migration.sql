-- AlterTable
ALTER TABLE "order_products" ADD COLUMN "product_name_ro_at_order" TEXT,
ADD COLUMN "product_name_ru_at_order" TEXT;

-- Backfill existing rows from current product names
UPDATE "order_products" op
SET "product_name_ro_at_order" = p."name_ro",
    "product_name_ru_at_order" = p."name_ru"
FROM "product_variants" pv
JOIN "products" p ON p.id = pv.product_id
WHERE pv.id = op.variant_id;

-- Enforce NOT NULL now that existing rows are backfilled
ALTER TABLE "order_products" ALTER COLUMN "product_name_ro_at_order" SET NOT NULL,
ALTER COLUMN "product_name_ru_at_order" SET NOT NULL;
