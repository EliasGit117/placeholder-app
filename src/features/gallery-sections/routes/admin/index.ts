import { adminGallerySectionsGetById } from './get-by-id.ts';
import { adminGallerySectionsCreate } from './create.ts';
import { adminGallerySectionsUpdate } from './update.ts';
import { adminGallerySectionsGetAll } from './get-all.ts';
import { adminGallerySectionsDelete } from './delete.ts';
import { adminGallerySectionsSearch } from './search.ts';


export const galleryAdminRoutes = {
  sections: {
    getAll: adminGallerySectionsGetAll,
    getById: adminGallerySectionsGetById,
    create: adminGallerySectionsCreate,
    update: adminGallerySectionsUpdate,
    delete: adminGallerySectionsDelete,
    search: adminGallerySectionsSearch,
  },
};
