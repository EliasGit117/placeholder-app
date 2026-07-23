import { z } from 'zod';
import { authMiddleware } from '@/lib/auth/middleware.ts';
import { auth } from '@/lib/auth/better-auth.ts';
import { productsAdminBase, productsAdminPath } from './base.ts';
import { ProductService } from '../../common/services/product-service.ts';
import { ImageService } from '@/features/images/common/services/image-service.ts';
import {
  productVariantImageDtoSchema,
  ProductVariantImageDtoFactory,
} from '../../common/dtos/product-variant-image.ts';
import { ImageResourceType } from '~/prisma/generated/prisma/enums.ts';

export const adminProductsGetVariantImages = productsAdminBase
  .route({
    method: 'GET',
    path: `${productsAdminPath}/variants/{variantId}/images`,
    summary: 'Get images for product variant',
    description: 'Returns all images attached to a product variant',
  })
  .errors({ FORBIDDEN: {}, NOT_FOUND: {} })
  .use(authMiddleware)
  .input(z.object({ variantId: z.number().int().positive() }))
  .output(z.array(productVariantImageDtoSchema))
  .handler(async ({ input, context: { user }, errors }) => {
    const { success } = await auth.api.userHasPermission({
      body: { userId: user.id, permissions: { products: ['get'] } },
    });

    if (!success)
      throw errors.FORBIDDEN();

    const variant = await ProductService.findVariantById(input.variantId);
    if (variant == null)
      throw errors.NOT_FOUND();

    const images = await ImageService.findByResource(
      ImageResourceType.PRODUCT_VARIANT,
      String(input.variantId)
    );

    return ProductVariantImageDtoFactory.fromImageDtos(images);
  });
