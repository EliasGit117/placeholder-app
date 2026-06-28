import { z } from 'zod';
import { authMiddleware } from '@/lib/auth/middleware.ts';
import { auth } from '@/lib/auth/better-auth.ts';
import { ImageResourceType } from '~/prisma/generated/prisma/enums.ts';
import { bannersAdminBase, bannersAdminPath } from './base.ts';
import { BannerService } from '../../services/banner-service.ts';
import { ImageService } from '@/features/images/services/image-service.ts';
import { bannerBriefDtoSchema, BannerBriefDtoFactory } from '@/features/banners/dtos/banner-brief.ts';

export const adminBannersGetAll = bannersAdminBase
  .route({
    method: 'GET',
    path: bannersAdminPath,
    summary: 'Get all banners',
    description: 'Returns all banners (with their device images) ordered by display order'
  })
  .errors({ FORBIDDEN: {} })
  .use(authMiddleware)
  .output(z.array(bannerBriefDtoSchema))
  .handler(async ({ context: { user }, errors }) => {
    const { success } = await auth.api.userHasPermission({
      body: { userId: user.id, permissions: { banners: ['list'] } }
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

    return BannerBriefDtoFactory.fromEntities(banners, images);
  });
