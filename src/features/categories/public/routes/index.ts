import { listCategories } from '@/features/categories/public/routes/list.ts';
import { getCategoriesTree } from '@/features/categories/public/routes/tree.ts';

export const categoriesRoutes = {
  list: listCategories,
  getTree: getCategoriesTree
};
