ALTER TABLE "order_products" RENAME COLUMN "product_name_ro_at_order" TO "product_name_ro";
ALTER TABLE "order_products" RENAME COLUMN "product_name_ru_at_order" TO "product_name_ru";
ALTER TABLE "order_products" RENAME COLUMN "name_ro_at_order" TO "variant_name_ro";
ALTER TABLE "order_products" RENAME COLUMN "name_ru_at_order" TO "variant_name_ru";
ALTER TABLE "order_products" RENAME COLUMN "price_at_order" TO "price";
ALTER TABLE "order_products" RENAME COLUMN "discount_at_order" TO "discount_percent";
