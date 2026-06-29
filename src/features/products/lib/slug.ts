// Pure, dependency-free slug helpers shared by the server service and the client variant form.
// Kept out of product-service.ts so the browser can import them without pulling in prisma/ORPC.

export function slugifyValue(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function buildFullSlug(productSlug: string, variantSlug: string): string {
  return `${productSlug}-${variantSlug}`;
}
