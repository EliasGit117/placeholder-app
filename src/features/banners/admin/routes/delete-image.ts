import { z } from 'zod';
import { authMiddleware } from '@/lib/auth/middleware.ts';
import { auth } from '@/lib/auth/better-auth.ts';
import { bannersAdminBase, bannersAdminPath } from './base.ts';
import { BannerService } from '@/features/banners/common/services/banner-service.ts';
import { ImageService } from '@/features/images/common/services/image-service.ts';
import { ImageResourceType } from '~/prisma/generated/prisma/enums.ts';
import { bannerDevices, bannerImagePurposeByLocaleDevice } from '@/features/banners/common/consts/banner-devices.ts';
import { baseLocale, locales } from '@/paraglide/runtime';

export const adminBannersDeleteImage = bannersAdminBase
  .route({
    method: 'DELETE',
    path: `${bannersAdminPath}/{bannerId}/image`,
    summary: 'Delete a banner image',
    description: 'Removes a banner device image (and its storage object) from a banner',
  })
  .errors({ FORBIDDEN: {}, NOT_FOUND: {} })
  .use(authMiddleware)
  .input(z.object({
    bannerId: z.coerce.number().int().positive(),
    device: z.enum(bannerDevices).default('desktop'),
    locale: z.enum(locales).default(baseLocale),
  }))
  .output(z.object({ deleted: z.boolean() }))
  .handler(async ({ input, context: { user }, errors }) => {
    const { success } = await auth.api.userHasPermission({
      body: { userId: user.id, permissions: { banners: ['update'] } },
    });

    if (!success)
      throw errors.FORBIDDEN();

    const banner = await BannerService.findById(input.bannerId);
    if (banner == null)
      throw errors.NOT_FOUND();

    const [image] = await ImageService.findByResource(
      ImageResourceType.BANNER,
      String(input.bannerId),
      bannerImagePurposeByLocaleDevice[input.locale][input.device]
    );

    if (image == null)
      return { deleted: false };

    await ImageService.delete(image.id);
    return { deleted: true };
  });
