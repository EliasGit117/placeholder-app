import { publicGallerySectionsGetAll } from './get-all.ts';
import { publicGallerySectionsGetBySlug } from './get-by-slug.ts';
import { publicGallerySectionsGetImages } from './get-images.ts';


export const galleryPublicRoutes = {
  sections: {
    getAll: publicGallerySectionsGetAll,
    getBySlug: publicGallerySectionsGetBySlug,
    getImages: publicGallerySectionsGetImages,
  },
};
