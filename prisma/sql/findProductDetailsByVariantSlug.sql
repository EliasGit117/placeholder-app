-- Public product-detail lookup, fused into one round trip: resolves the
-- variant by its full slug, then in the same statement pulls the parent
-- product, category, every sellable sibling variant, and the target
-- variant's images (with thumbnails) via correlated json_agg subqueries.
WITH target_variant AS (
  SELECT id, product_id, state
  FROM product_variants
  WHERE full_slug = $1
  LIMIT 1
)
SELECT
  tv.id AS "variantId",
  p.id AS "productId",
  p.name_ro AS "nameRo",
  p.name_ru AS "nameRu",
  p.slug AS "slug",
  p.short_description_ro AS "shortDescriptionRo",
  p.short_description_ru AS "shortDescriptionRu",
  p.description_ro AS "descriptionRo",
  p.description_ru AS "descriptionRu",
  p.category_id AS "categoryId",
  p.option_schema::json AS "options",
  c.name_ro AS "categoryNameRo",
  c.name_ru AS "categoryNameRu",
  COALESCE((
    SELECT json_agg(json_build_object(
      'id', v.id,
      'nameRo', v.name_ro,
      'nameRu', v.name_ru,
      'fullSlug', v.full_slug,
      'optionValues', v.option_values::json,
      'price', v.price,
      'discountPercent', v.discount_percent,
      'state', v.state
    ) ORDER BY v.id)
    FROM product_variants v
    WHERE v.product_id = p.id AND v.state IN ('active', 'not_available')
  ), '[]'::json) AS "variants",
  COALESCE((
    SELECT json_agg(json_build_object(
      'id', img.id,
      'url', img.url,
      'width', img.width,
      'height', img.height,
      'thumbhash', img.thumbhash,
      'order', img."order",
      'variants', COALESCE((
        SELECT json_agg(json_build_object('kind', iv.kind, 'url', iv.url, 'width', iv.width, 'height', iv.height))
        FROM image_variants iv
        WHERE iv.image_id = img.id
      ), '[]'::json)
    ) ORDER BY img."order")
    FROM images img
    WHERE img.resource_type = 'PRODUCT_VARIANT' AND img.resource_id = tv.id::text
  ), '[]'::json) AS "images"
FROM target_variant tv
JOIN products p ON p.id = tv.product_id AND p.state = 'active'
LEFT JOIN categories c ON c.id = p.category_id
WHERE tv.state IN ('active', 'not_available')
