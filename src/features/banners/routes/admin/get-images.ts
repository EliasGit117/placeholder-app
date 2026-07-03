import { z } from 'zod';
import { authMiddleware } from '@/lib/auth/middleware.ts';
import { auth } from '@/lib/auth/better-auth.ts';
import { bannersAdminBase, bannersAdminPath } from './base.ts';
import { BannerService } from '../../services/banner-service.ts';
import { ImageService } from '@/features/images/services/image-service.ts';
import {
  bannerImagesByLocaleDtoSchema,
  BannerImageDtoFactory,
  type TBannerImagesByLocaleDto
} from '@/features/banners/dtos/banner-image.ts';
import { bannerImagePurposeByLocaleDevice } from '@/features/banners/consts/banner-devices.ts';
import { ImageResourceType } from '~/prisma/generated/prisma/enums.ts';
import { locales } from '@/paraglide/runtime';

export const adminBannersGetImages = bannersAdminBase
  .route({
    method: 'GET',
    path: `${bannersAdminPath}/{bannerId}/images`,
    summary: 'Get banner images',
    description: 'Returns every locale\'s desktop (3:1) and mobile (6:5) images for a banner',
  })
  .errors({ FORBIDDEN: {}, NOT_FOUND: {} })
  .use(authMiddleware)
  .input(z.object({ bannerId: z.coerce.number().int().positive() }))
  .output(bannerImagesByLocaleDtoSchema)
  .handler(async ({ input, context: { user }, errors }) => {
    const { success } = await auth.api.userHasPermission({
      body: { userId: user.id, permissions: { banners: ['get'] } },
    });

    if (!success)
      throw errors.FORBIDDEN();

    const banner = await BannerService.findById(input.bannerId);
    if (banner == null)
      throw errors.NOT_FOUND();

    // One query for all of the banner's images, then bucket each locale's
    // device pair out of it — a single round-trip for every locale tab.
    const images = await ImageService.findByResource(
      ImageResourceType.BANNER,
      String(input.bannerId)
    );

    return Object.fromEntries(locales.map((locale) => {
      const purposes = bannerImagePurposeByLocaleDevice[locale];
      return [locale, {
        desktop: BannerImageDtoFactory.fromImageDto(images.find((img) => img.purpose === purposes.desktop) ?? null),
        mobile: BannerImageDtoFactory.fromImageDto(images.find((img) => img.purpose === purposes.mobile) ?? null),
      }];
    })) as TBannerImagesByLocaleDto;
  });
