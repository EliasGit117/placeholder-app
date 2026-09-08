-- AlterTable
ALTER TABLE "online_payments" ADD COLUMN     "attempt_count" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "online_payments_status_attempt_count_idx" ON "online_payments"("status", "attempt_count");
