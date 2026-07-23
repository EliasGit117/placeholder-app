import { z } from 'zod';
import { authMiddleware } from '@/lib/auth/middleware.ts';
import { auth } from '@/lib/auth/better-auth.ts';
import { productsAdminBase, productsAdminPath } from './base.ts';
import { ProductService } from '../../common/services/product-service.ts';
import { ImageService } from '@/features/images/common/services/image-service.ts';
import { ImageResourceType } from '~/prisma/generated/prisma/enums.ts';

const deleteVariantImagesInputSchema = z.object({
  variantId: z.number().int().positive(),
  ids: z.array(z.number().int().positive()).min(1),
});

export const adminProductsDeleteVariantImages = productsAdminBase
  .route({
    method: 'DELETE',
    path: `${productsAdminPath}/variants/{variantId}/images`,
    summary: 'Delete product variant images',
    description: 'Removes the given images (and their variants) from a product variant and storage',
  })
  .errors({ FORBIDDEN: {}, NOT_FOUND: {} })
  .use(authMiddleware)
  .input(deleteVariantImagesInputSchema)
  .output(z.object({ deleted: z.number() }))
  .handler(async ({ input, context: { user }, errors }) => {
    const { success } = await auth.api.userHasPermission({
      body: { userId: user.id, permissions: { products: ['delete'] } },
    });

    if (!success)
      throw errors.FORBIDDEN();

    const variant = await ProductService.findVariantById(input.variantId);
    if (variant == null)
      throw errors.NOT_FOUND();

    const deleted = await ImageService.deleteManyForResource(
      ImageResourceType.PRODUCT_VARIANT,
      String(input.variantId),
      input.ids
    );

    return { deleted };
  });
