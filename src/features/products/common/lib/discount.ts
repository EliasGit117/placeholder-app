// Pure, dependency-free discount helper shared by the server service and the client admin UI.

export function computeDiscountedPrice(price: number, discountPercent: number | null | undefined): number {
  if (!discountPercent) return price;
  return Math.round(price * (1 - discountPercent / 100));
}
