import { z } from 'zod';
import { authMiddleware } from '@/lib/auth/middleware.ts';
import { auth } from '@/lib/auth/better-auth.ts';
import { bannersAdminBase, bannersAdminPath } from './base.ts';
import { BannerService } from '../../services/banner-service.ts';
import { ImageService } from '@/features/images/services/image-service.ts';
import { bannerImagesDtoSchema, BannerImageDtoFactory } from '@/features/banners/dtos/banner-image.ts';
import { bannerImagePurposeByDevice } from '@/features/banners/consts/banner-devices.ts';
import { ImageResourceType } from '~/prisma/generated/prisma/enums.ts';

export const adminBannersGetImages = bannersAdminBase
  .route({
    method: 'GET',
    path: `${bannersAdminPath}/{bannerId}/images`,
    summary: 'Get banner images',
    description: 'Returns the desktop (3:1) and mobile (6:5) images for a banner',
  })
  .errors({ FORBIDDEN: {}, NOT_FOUND: {} })
  .use(authMiddleware)
  .input(z.object({ bannerId: z.coerce.number().int().positive() }))
  .output(bannerImagesDtoSchema)
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

    const desktop = images.find((img) => img.purpose === bannerImagePurposeByDevice.desktop) ?? null;
    const mobile = images.find((img) => img.purpose === bannerImagePurposeByDevice.mobile) ?? null;

    return {
      desktop: BannerImageDtoFactory.fromImageDto(desktop),
      mobile: BannerImageDtoFactory.fromImageDto(mobile),
    };
  });
