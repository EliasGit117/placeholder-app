-- CreateEnum
CREATE TYPE "online_payment_refund_status" AS ENUM ('CREATED', 'REQUESTED', 'ACCEPTED', 'REJECTED', 'MANUAL');

-- AlterTable
ALTER TABLE "online_payments" ADD COLUMN     "refund_amount" INTEGER,
ADD COLUMN     "refund_id" TEXT,
ADD COLUMN     "refund_reason" TEXT,
ADD COLUMN     "refund_status" "online_payment_refund_status",
ADD COLUMN     "refunded_at" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "online_payments_refund_id_key" ON "online_payments"("refund_id");
