import { listProducts } from './list.ts';
import { getProductBySlug } from './get-by-slug.ts';
import { searchProducts } from './search.ts';

export const productsRoutes = {
  list: listProducts,
  getBySlug: getProductBySlug,
  search: searchProducts,
};
