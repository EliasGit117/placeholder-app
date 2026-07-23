import { z } from 'zod';
import { authMiddleware } from '@/lib/auth/middleware.ts';
import { auth } from '@/lib/auth/better-auth.ts';
import { productsAdminBase, productsAdminPath } from './base.ts';
import { ProductService } from '../../services/product-service.ts';
import { ImageService } from '@/features/images/common/services/image-service.ts';
import {
  productVariantImageDtoSchema,
  ProductVariantImageDtoFactory,
} from '../../dtos/product-variant-image.ts';
import { ImageResourceType } from '~/prisma/generated/prisma/enums.ts';

const reorderVariantImagesInputSchema = z.object({
  variantId: z.number().int().positive(),
  ids: z.array(z.number().int().positive()).min(1),
});

export const adminProductsReorderVariantImages = productsAdminBase
  .route({
    method: 'PATCH',
    path: `${productsAdminPath}/variants/{variantId}/images/order`,
    summary: 'Reorder product variant images',
    description: 'Applies a new display order for the images of a product variant',
  })
  .errors({ FORBIDDEN: {}, NOT_FOUND: {}, BAD_REQUEST: {} })
  .use(authMiddleware)
  .input(reorderVariantImagesInputSchema)
  .output(z.array(productVariantImageDtoSchema))
  .handler(async ({ input, context: { user }, errors }) => {
    const { success } = await auth.api.userHasPermission({
      body: { userId: user.id, permissions: { products: ['update'] } },
    });

    if (!success)
      throw errors.FORBIDDEN();

    const variant = await ProductService.findVariantById(input.variantId);
    if (variant == null)
      throw errors.NOT_FOUND();

    const images = await ImageService.reorderForResource(
      ImageResourceType.PRODUCT_VARIANT,
      String(input.variantId),
      input.ids
    );

    return ProductVariantImageDtoFactory.fromImageDtos(images);
  });
