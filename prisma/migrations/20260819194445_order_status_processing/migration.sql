CREATE TYPE "order_status_new" AS ENUM ('pending', 'processing', 'shipped', 'completed', 'cancelled');

ALTER TABLE "orders" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "orders" ALTER COLUMN "status" TYPE "order_status_new" USING (
  CASE status::text
    WHEN 'paid' THEN 'processing'
    ELSE status::text
  END
)::"order_status_new";
ALTER TABLE "orders" ALTER COLUMN "status" SET DEFAULT 'pending';

DROP TYPE "order_status";
ALTER TYPE "order_status_new" RENAME TO "order_status";
