// Slug helpers shared by the server service and the client variant form.
// Kept out of product-service.ts so the browser can import them without pulling in prisma/ORPC.
import slugify from '@sindresorhus/slugify';

export function slugifyValue(value: string): string {
  return slugify(value);
}

export function buildFullSlug(productSlug: string, variantSlug: string): string {
  return `${productSlug}-${variantSlug}`;
}
