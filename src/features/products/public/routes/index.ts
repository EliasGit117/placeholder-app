import { listProducts } from './list';
import { getProductBySlug } from './get-by-slug';
import { searchProducts } from './search';
import { getFavorites } from './get-favorites';
import { addToFavorites } from './add-to-favorites';
import { removeFromFavorites } from './remove-from-favorites';
import { clearFavorites } from './clear-favorites.ts';
import { getProductsById } from './get-products-by-id.ts';


export const productsRoutes = {
  list: listProducts,
  getBySlug: getProductBySlug,
  search: searchProducts,
  getFavorites: getFavorites,
  addToFavorites: addToFavorites,
  removeFromFavorites: removeFromFavorites,
  clearFavorites: clearFavorites,
  getProductsById: getProductsById,
};
