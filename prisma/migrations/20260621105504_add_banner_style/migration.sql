-- CreateEnum
CREATE TYPE "banner_style" AS ENUM ('white', 'dark');

-- AlterTable
ALTER TABLE "banners" ADD COLUMN     "desktop_style" "banner_style" NOT NULL DEFAULT 'white',
ADD COLUMN     "mobile_style" "banner_style" NOT NULL DEFAULT 'white',
ADD COLUMN     "tablet_style" "banner_style" NOT NULL DEFAULT 'white';
