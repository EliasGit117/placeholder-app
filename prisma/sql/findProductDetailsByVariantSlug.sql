-- Public product-detail lookup, fused into one round trip. Everything the
-- product page needs — the product, its category, every sellable sibling
-- variant, and the requested variant's own images (with thumbnails) —
-- comes back in a single query instead of two sequential round trips.
--
-- Localized server-side: $2 is the request locale ('ro' | 'ru'), so only
-- the matching name/description columns are selected instead of both.

-- Step 1: resolve the requested variant by its URL slug.
WITH target_variant AS (
  SELECT id, product_id, state
  FROM product_variants
  WHERE full_slug = $1
  LIMIT 1
),

-- Step 2: every sellable variant of that product (siblings + the target
-- itself), as one JSON array — lets the page switch color/size without a
-- refetch.
sibling_variants AS (
  SELECT json_agg(
    json_build_object(
      'id', v.id,
      'name', CASE WHEN $2 = 'ru' THEN v.name_ru ELSE v.name_ro END,
      'fullSlug', v.full_slug,
      'optionValues', v.option_values::json,
      'price', v.price,
      'discountPercent', v.discount_percent,
      'state', v.state
    )
    ORDER BY v.id
  ) AS variants
  FROM product_variants v
  JOIN target_variant tv ON v.product_id = tv.product_id
  WHERE v.state IN ('active', 'not_available')
),

-- Step 3: the target variant's own images, each with its thumbnail set.
target_images AS (
  SELECT json_agg(
    json_build_object(
      'id', img.id,
      'url', img.url,
      'width', img.width,
      'height', img.height,
      'thumbhash', img.thumbhash,
      'order', img."order",
      'variants', (
        SELECT COALESCE(json_agg(
          json_build_object('kind', iv.kind, 'url', iv.url, 'width', iv.width, 'height', iv.height)
        ), '[]'::json)
        FROM image_variants iv
        WHERE iv.image_id = img.id
      )
    )
    ORDER BY img."order"
  ) AS images
  FROM images img
  JOIN target_variant tv ON img.resource_id = tv.id::text
  WHERE img.resource_type = 'PRODUCT_VARIANT'
)

-- Step 4: assemble the product row, joined to its category, with the
-- sibling-variant and image arrays from above attached as plain columns.
SELECT
  tv.id AS "variantId",
  p.id AS "productId",
  CASE WHEN $2 = 'ru' THEN p.name_ru ELSE p.name_ro END AS "name",
  p.slug AS "slug",
  CASE WHEN $2 = 'ru' THEN p.short_description_ru ELSE p.short_description_ro END AS "shortDescription",
  CASE WHEN $2 = 'ru' THEN p.description_ru ELSE p.description_ro END AS "description",
  p.category_id AS "categoryId",
  p.option_schema::json AS "options",
  CASE WHEN $2 = 'ru' THEN c.name_ru ELSE c.name_ro END AS "categoryName",
  COALESCE(sv.variants, '[]'::json) AS "variants",
  COALESCE(ti.images, '[]'::json) AS "images"
FROM target_variant tv
JOIN products p ON p.id = tv.product_id AND p.state = 'active'
LEFT JOIN categories c ON c.id = p.category_id
CROSS JOIN sibling_variants sv
CROSS JOIN target_images ti
WHERE tv.state IN ('active', 'not_available')
