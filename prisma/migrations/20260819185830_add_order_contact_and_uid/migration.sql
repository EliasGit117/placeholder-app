-- CreateEnum
CREATE TYPE "delivery_method" AS ENUM ('courier', 'pickup');

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "address" TEXT NOT NULL,
ADD COLUMN     "delivery_method" "delivery_method" NOT NULL,
ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "full_name" TEXT NOT NULL,
ADD COLUMN     "phone" TEXT NOT NULL,
ADD COLUMN     "uid" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "orders_uid_key" ON "orders"("uid");
