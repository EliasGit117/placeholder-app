import { adminBrandsSearch } from './search.ts';
import { adminBrandsGetAll } from './get-all.ts';
import { adminBrandsGetById } from './get-by-id.ts';
import { adminBrandsCreate } from './create.ts';
import { adminBrandsUpdate } from './update.ts';
import { adminBrandsDelete } from './delete.ts';


export const brandsAdminRoutes = {
  search: adminBrandsSearch,
  getAll: adminBrandsGetAll,
  getById: adminBrandsGetById,
  create: adminBrandsCreate,
  update: adminBrandsUpdate,
  delete: adminBrandsDelete,
};
