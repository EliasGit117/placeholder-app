import { publicGallerySectionsGetAll } from './get-all.ts';
import { publicGallerySectionsGetWithImages } from './get-with-images.ts';


export const galleryPublicRoutes = {
  sections: {
    getAll: publicGallerySectionsGetAll,
    getWithImages: publicGallerySectionsGetWithImages,
  },
};
