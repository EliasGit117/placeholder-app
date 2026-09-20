ALTER TYPE "product_state" RENAME VALUE 'active' TO 'ACTIVE';
ALTER TYPE "product_state" RENAME VALUE 'not_available' TO 'NOT_AVAILABLE';
ALTER TYPE "product_state" RENAME VALUE 'hidden' TO 'HIDDEN';
ALTER TYPE "product_state" RENAME VALUE 'archived' TO 'ARCHIVED';

ALTER TYPE "CategoryState" RENAME VALUE 'active' TO 'ACTIVE';
ALTER TYPE "CategoryState" RENAME VALUE 'hidden' TO 'HIDDEN';

ALTER TYPE "order_status" RENAME VALUE 'pending' TO 'PENDING';
ALTER TYPE "order_status" RENAME VALUE 'processing' TO 'PROCESSING';
ALTER TYPE "order_status" RENAME VALUE 'shipped' TO 'SHIPPED';
ALTER TYPE "order_status" RENAME VALUE 'completed' TO 'COMPLETED';
ALTER TYPE "order_status" RENAME VALUE 'cancelled' TO 'CANCELLED';

ALTER TYPE "delivery_method" RENAME VALUE 'courier' TO 'COURIER';
ALTER TYPE "delivery_method" RENAME VALUE 'pickup' TO 'PICKUP';

ALTER TYPE "online_payment_provider" RENAME VALUE 'maib' TO 'MAIB';

ALTER TYPE "online_payment_status" RENAME VALUE 'waiting_for_init' TO 'WAITING_FOR_INIT';
ALTER TYPE "online_payment_status" RENAME VALUE 'initialized' TO 'INITIALIZED';
ALTER TYPE "online_payment_status" RENAME VALUE 'payment_method_selected' TO 'PAYMENT_METHOD_SELECTED';
ALTER TYPE "online_payment_status" RENAME VALUE 'completed' TO 'COMPLETED';
ALTER TYPE "online_payment_status" RENAME VALUE 'expired' TO 'EXPIRED';
ALTER TYPE "online_payment_status" RENAME VALUE 'abandoned' TO 'ABANDONED';
ALTER TYPE "online_payment_status" RENAME VALUE 'cancelled' TO 'CANCELLED';
ALTER TYPE "online_payment_status" RENAME VALUE 'failed' TO 'FAILED';
