import { adminBannersGetAll } from './get-all.ts';
import { adminBannersGetById } from './get-by-id.ts';
import { adminBannersCreate } from './create.ts';
import { adminBannersUpdate } from './update.ts';
import { adminBannersDelete } from './delete.ts';
import { adminBannersSearch } from './search.ts';
import { adminBannersReorder } from './reorder.ts';
import { adminBannersGetImages } from './get-images.ts';
import { adminBannersDeleteImage } from './delete-image.ts';


export const bannersAdminRoutes = {
  getAll: adminBannersGetAll,
  getById: adminBannersGetById,
  create: adminBannersCreate,
  update: adminBannersUpdate,
  delete: adminBannersDelete,
  search: adminBannersSearch,
  reorder: adminBannersReorder,
  getImages: adminBannersGetImages,
  deleteImage: adminBannersDeleteImage,
};
