import { listCategories } from 'src/features/categories/routes/public/list.ts';
import { getCategoriesTree } from 'src/features/categories/routes/public/tree.ts';

export const categoriesRoutes = {
  list: listCategories,
  getTree: getCategoriesTree
};
