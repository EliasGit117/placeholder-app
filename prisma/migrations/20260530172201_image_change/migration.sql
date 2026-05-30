/*
  Warnings:

  - The values [PRIMARY,THUMBNAIL,BACKGROUND] on the enum `image_purpose` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `todos` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "image_purpose_new" AS ENUM ('BASE', 'THUMB_256x256', 'THUMB_512x512');
ALTER TABLE "images" ALTER COLUMN "purpose" TYPE "image_purpose_new" USING ("purpose"::text::"image_purpose_new");
ALTER TYPE "image_purpose" RENAME TO "image_purpose_old";
ALTER TYPE "image_purpose_new" RENAME TO "image_purpose";
DROP TYPE "public"."image_purpose_old";
COMMIT;

-- AlterTable
ALTER TABLE "images" ALTER COLUMN "resource_id" SET DATA TYPE TEXT;

-- DropTable
DROP TABLE "todos";

-- DropEnum
DROP TYPE "todo_state";
