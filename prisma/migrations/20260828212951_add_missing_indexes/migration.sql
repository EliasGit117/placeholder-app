-- CreateIndex
CREATE INDEX "categories_parent_id_idx" ON "categories"("parent_id");

-- CreateIndex
CREATE INDEX "orders_status_idx" ON "orders"("status");

-- CreateIndex
CREATE INDEX "orders_created_at_idx" ON "orders"("created_at");

-- CreateIndex
CREATE INDEX "product_variants_state_idx" ON "product_variants"("state");

-- CreateIndex
CREATE INDEX "product_variants_created_at_idx" ON "product_variants"("created_at");

-- CreateIndex
CREATE INDEX "products_state_idx" ON "products"("state");

-- CreateIndex
CREATE INDEX "products_created_at_idx" ON "products"("created_at");
