import { getCategoriesTree } from '@/features/categories/public/routes/tree.ts';
import { getCategoryById } from '@/features/categories/public/routes/get-by-id.ts';

export const categoriesRoutes = {
  getTree: getCategoriesTree,
  getById: getCategoryById
};
