import { adminProductsSearch } from './search.ts';
import { adminProductsGet } from './get.ts';
import { adminProductsCreate } from './create.ts';
import { adminProductsUpdate } from './update.ts';
import { adminProductsDelete } from './delete.ts';
import { adminProductsAddVariant } from './add-variant.ts';
import { adminProductsUpdateVariant } from './update-variant.ts';
import { adminProductsDeleteVariant } from './delete-variant.ts';
import { adminProductsGetVariantImages } from './get-variant-images.ts';
import { adminProductsDeleteVariantImages } from './delete-variant-images.ts';
import { adminProductsReorderVariantImages } from './reorder-variant-images.ts';

export const productsAdminRoutes = {
  search: adminProductsSearch,
  get: adminProductsGet,
  create: adminProductsCreate,
  update: adminProductsUpdate,
  delete: adminProductsDelete,
  addVariant: adminProductsAddVariant,
  updateVariant: adminProductsUpdateVariant,
  deleteVariant: adminProductsDeleteVariant,
  getVariantImages: adminProductsGetVariantImages,
  deleteVariantImages: adminProductsDeleteVariantImages,
  reorderVariantImages: adminProductsReorderVariantImages,
};
