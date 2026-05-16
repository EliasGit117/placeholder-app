import { adminCategoriesSearch } from './search.ts';
import { adminCategoriesGetForest } from './get-forest.ts';
import { adminCategoriesCreate } from './create.ts';
import { adminCategoriesUpdate } from './update.ts';
import { adminCategoriesDelete } from './delete.ts';

export const categoriesAdminRoutes = {
  search: adminCategoriesSearch,
  getForest: adminCategoriesGetForest,
  create: adminCategoriesCreate,
  update: adminCategoriesUpdate,
  delete: adminCategoriesDelete,
};
