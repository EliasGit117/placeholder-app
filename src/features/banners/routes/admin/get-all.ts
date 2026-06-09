import { z } from 'zod';
import { authMiddleware } from '@/lib/auth/middleware.ts';
import { auth } from '@/lib/auth/better-auth.ts';
import { ImageResourceType } from '~/prisma/generated/prisma/enums.ts';
import { bannersAdminBase, bannersAdminPath } from './base.ts';
import { BannerService } from '../../services/banner-service.ts';
import { ImageService } from '@/features/images/services/image-service.ts';
import { BannerDtoFactory } from '@/features/banners/dtos/banner.ts';
import { BannerImagesDtoFactory } from '@/features/banners/dtos/banner-image.ts';
import { bannerRowDtoSchema } from '@/features/banners/dtos/banner-row.ts';

export const adminBannersGetAll = bannersAdminBase
  .route({
    method: 'GET',
    path: bannersAdminPath,
    summary: 'Get all banners',
    description: 'Returns all banners (with their device images) ordered by display order',
  })
  .errors({ FORBIDDEN: {} })
  .use(authMiddleware)
  .output(z.array(bannerRowDtoSchema))
  .handler(async ({ context: { user }, errors }) => {
    const { success } = await auth.api.userHasPermission({
      body: { userId: user.id, permissions: { banners: ['list'] } },
    });

    if (!success)
      throw errors.FORBIDDEN();

    const banners = await BannerService.getAll();
    if (banners.length === 0)
      return [];

    // One query for every banner's images, bucketed by resource id — avoids a
    // per-row request from the table preview cells.
    const images = await ImageService.findByResources(
      ImageResourceType.BANNER,
      banners.map((b) => String(b.id))
    );

    return banners.map((banner) => ({
      ...BannerDtoFactory.fromEntity(banner),
      images: BannerImagesDtoFactory.fromImageDtos(
        images.filter((img) => img.resourceId === String(banner.id))
      ),
    }));
  });
