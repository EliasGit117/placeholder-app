import { z } from 'zod';
import { authMiddleware } from '@/lib/auth/middleware.ts';
import { auth } from '@/lib/auth/better-auth.ts';
import { prisma } from '@/lib/db';
import { categoriesAdminBase, categoriesAdminPath } from './base.ts';
import { CategoryService } from '@/features/categories/common/services/category-service.ts';
import { ImageService } from '@/features/images/common/services/image-service.ts';
import { ImageResourceType } from '~/prisma/generated/prisma/enums.ts';

export const adminCategoriesDeleteImage = categoriesAdminBase
  .route({
    method: 'DELETE',
    path: `${categoriesAdminPath}/{id}/image`,
    summary: 'Delete category image',
    description: 'Removes the image attached to a category, if any.',
  })
  .errors({ FORBIDDEN: {}, NOT_FOUND: {} })
  .use(authMiddleware)
  .input(z.object({ id: z.number().int().positive() }))
  .output(z.object({ ok: z.literal(true) }))
  .handler(async ({ input, context: { user }, errors }) => {
    const { success } = await auth.api.userHasPermission({
      body: { userId: user.id, permissions: { categories: ['update'] } },
    });

    if (!success)
      throw errors.FORBIDDEN();

    const category = await CategoryService.findById(input.id);
    if (category == null)
      throw errors.NOT_FOUND();

    const existing = await prisma.image.findFirst({
      where: { resourceType: ImageResourceType.CATEGORY, resourceId: String(input.id) },
    });

    if (existing)
      await ImageService.delete(existing.id);

    return { ok: true as const };
  });
