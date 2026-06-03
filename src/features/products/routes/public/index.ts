import { listProducts } from './list.ts';
import { getProductBySlug } from './get-by-slug.ts';

export const productsRoutes = {
  list: listProducts,
  getBySlug: getProductBySlug,
};
