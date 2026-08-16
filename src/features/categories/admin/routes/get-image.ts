import { z } from 'zod';
import { authMiddleware } from '@/lib/auth/middleware.ts';
import { auth } from '@/lib/auth/better-auth.ts';
import { categoriesAdminBase, categoriesAdminPath } from './base.ts';
import { CategoryService } from '@/features/categories/common/services/category-service.ts';
import { ImageService } from '@/features/images/common/services/image-service.ts';
import { CategoryImageDtoFactory, categoryImageDtoSchema } from '@/features/categories/common/dtos/category-image.ts';
import { ImageResourceType, ImagePurpose } from '~/prisma/generated/prisma/enums.ts';

export const adminCategoriesGetImage = categoriesAdminBase
  .route({
    method: 'GET',
    path: `${categoriesAdminPath}/{id}/image`,
    summary: 'Get category image',
    description: 'Returns the image attached to a category, if any.',
  })
  .errors({ FORBIDDEN: {}, NOT_FOUND: {} })
  .use(authMiddleware)
  .input(z.object({ id: z.number().int().positive() }))
  .output(categoryImageDtoSchema.nullable())
  .handler(async ({ input, context: { user }, errors }) => {
    const { success } = await auth.api.userHasPermission({
      body: { userId: user.id, permissions: { categories: ['get'] } },
    });

    if (!success)
      throw errors.FORBIDDEN();

    const category = await CategoryService.findById(input.id);
    if (category == null)
      throw errors.NOT_FOUND();

    const [image] = await ImageService.findByResource(
      ImageResourceType.CATEGORY,
      String(input.id),
      ImagePurpose.CATEGORY_IMAGE
    );

    return image ? CategoryImageDtoFactory.fromImageDto(image) : null;
  });
