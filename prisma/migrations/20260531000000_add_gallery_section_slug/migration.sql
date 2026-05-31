-- Add slug column (nullable first so existing rows can be backfilled)
ALTER TABLE "gallery_sections" ADD COLUMN "slug" TEXT;

-- Backfill existing rows with a deterministic, unique placeholder slug
UPDATE "gallery_sections" SET "slug" = 'section-' || "id" WHERE "slug" IS NULL;

-- Enforce NOT NULL now that all rows have a value
ALTER TABLE "gallery_sections" ALTER COLUMN "slug" SET NOT NULL;

-- Unique constraint
CREATE UNIQUE INDEX "gallery_sections_slug_key" ON "gallery_sections"("slug");
