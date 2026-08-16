import { z } from 'zod';
import { authMiddleware } from '@/lib/auth/middleware.ts';
import { auth } from '@/lib/auth/better-auth.ts';
import { prisma } from '@/lib/db';
import { categoriesAdminBase, categoriesAdminPath } from './base.ts';
import { CategoryService } from '@/features/categories/common/services/category-service.ts';
import { ImageService } from '@/features/images/common/services/image-service.ts';
import { CategoryImageDtoFactory, categoryImageDtoSchema } from '@/features/categories/common/dtos/category-image.ts';
import { ImageResourceType, ImagePurpose } from '~/prisma/generated/prisma/enums.ts';

const uploadCategoryImageInputSchema = z.object({
  id: z.number().int().positive(),
  file: z.instanceof(File),
});

export const adminCategoriesUploadImage = categoriesAdminBase
  .route({
    method: 'POST',
    path: `${categoriesAdminPath}/{id}/image`,
    summary: 'Upload category image',
    description: 'Validates, transforms and stores the category image, replacing any existing one.',
  })
  .errors({ FORBIDDEN: {}, NOT_FOUND: {} })
  .use(authMiddleware)
  .input(uploadCategoryImageInputSchema)
  .output(categoryImageDtoSchema)
  .handler(async ({ input, context: { user }, errors }) => {
    const { success } = await auth.api.userHasPermission({
      body: { userId: user.id, permissions: { categories: ['update'] } },
    });

    if (!success)
      throw errors.FORBIDDEN();

    const category = await CategoryService.findById(input.id);
    if (category == null)
      throw errors.NOT_FOUND();

    // CATEGORY_IMAGE is single-cardinality, so the new upload would be
    // rejected while the old image still exists. Replace by deleting the
    // previous image first, then uploading the new one.
    const existing = await prisma.image.findFirst({
      where: { resourceType: ImageResourceType.CATEGORY, resourceId: String(input.id) },
    });

    if (existing)
      await ImageService.delete(existing.id).catch((error) => {
        // Non-fatal: a stale previous image shouldn't block the new upload, but
        // it leaves an orphaned storage object, so surface it for cleanup.
        console.error('[Category] Failed to delete previous image before replace', {
          imageId: existing.id,
          categoryId: input.id,
          error,
        });
      });

    const image = await ImageService.upload({
      file: input.file,
      resourceType: ImageResourceType.CATEGORY,
      purpose: ImagePurpose.CATEGORY_IMAGE,
      resourceId: String(input.id),
      fileName: `category-${input.id}`,
    });

    return CategoryImageDtoFactory.fromImageDto(image);
  });
