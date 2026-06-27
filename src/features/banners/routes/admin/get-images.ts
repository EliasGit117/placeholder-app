import { z } from 'zod';
import { authMiddleware } from '@/lib/auth/middleware.ts';
import { auth } from '@/lib/auth/better-auth.ts';
import { bannersAdminBase, bannersAdminPath } from './base.ts';
import { BannerService } from '../../services/banner-service.ts';
import { ImageService } from '@/features/images/services/image-service.ts';
import { bannerImageDtoSchema, BannerImageDtoFactory } from '@/features/banners/dtos/banner-image.ts';
import { ImageResourceType } from '~/prisma/generated/prisma/enums.ts';

export const adminBannersGetImages = bannersAdminBase
  .route({
    method: 'GET',
    path: `${bannersAdminPath}/{bannerId}/images`,
    summary: 'Get banner image',
    description: 'Returns the single 16:9 image for a banner',
  })
  .errors({ FORBIDDEN: {}, NOT_FOUND: {} })
  .use(authMiddleware)
  .input(z.object({ bannerId: z.coerce.number().int().positive() }))
  .output(bannerImageDtoSchema.nullish())
  .handler(async ({ input, context: { user }, errors }) => {
    const { success } = await auth.api.userHasPermission({
      body: { userId: user.id, permissions: { banners: ['get'] } },
    });

    if (!success)
      throw errors.FORBIDDEN();

    const banner = await BannerService.findById(input.bannerId);
    if (banner == null)
      throw errors.NOT_FOUND();

    const images = await ImageService.findByResource(
      ImageResourceType.BANNER,
      String(input.bannerId)
    );

    return BannerImageDtoFactory.fromImageDto(images[0] ?? null);
  });
