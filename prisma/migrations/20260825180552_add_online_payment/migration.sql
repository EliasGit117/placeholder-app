-- CreateEnum
CREATE TYPE "online_payment_provider" AS ENUM ('maib');

-- CreateEnum
CREATE TYPE "online_payment_status" AS ENUM ('waiting_for_init', 'initialized', 'payment_method_selected', 'completed', 'expired', 'abandoned', 'cancelled', 'failed');

-- CreateTable
CREATE TABLE "online_payments" (
    "id" SERIAL NOT NULL,
    "order_id" INTEGER NOT NULL,
    "provider" "online_payment_provider" NOT NULL DEFAULT 'maib',
    "status" "online_payment_status" NOT NULL DEFAULT 'waiting_for_init',
    "checkout_id" TEXT,
    "checkout_url" TEXT,
    "callback_url" TEXT,
    "payment_id" TEXT,
    "expires_at" TIMESTAMP(3),
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'MDL',
    "payment_method" TEXT,
    "reference_number" TEXT,
    "executed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "online_payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "online_payments_order_id_key" ON "online_payments"("order_id");

-- CreateIndex
CREATE UNIQUE INDEX "online_payments_checkout_id_key" ON "online_payments"("checkout_id");

-- CreateIndex
CREATE UNIQUE INDEX "online_payments_payment_id_key" ON "online_payments"("payment_id");

-- AddForeignKey
ALTER TABLE "online_payments" ADD CONSTRAINT "online_payments_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
