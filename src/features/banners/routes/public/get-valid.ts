import { z } from 'zod';
import { ImageResourceType } from '~/prisma/generated/prisma/enums.ts';
import { bannersPublicBase, bannersPublicPath } from './base.ts';
import { BannerService } from '../../services/banner-service.ts';
import { ImageService } from '@/features/images/services/image-service.ts';
import { bannerPublicDtoSchema, BannerPublicDtoFactory } from '@/features/banners/dtos/banner-public.ts';

export const publicBannersGetValid = bannersPublicBase
  .route({
    method: 'GET',
    path: bannersPublicPath,
    summary: 'List valid banners',
    description: 'Returns active banners that have an image set, in display order, each with its image',
  })
  .meta({ anonymous: true })
  .output(z.array(bannerPublicDtoSchema))
  .handler(async () => {
    const banners = await BannerService.findAllValid();
    if (banners.length === 0)
      return [];

    // One query for every banner's images, then bucket by resource id — avoids
    // an N+1 across the valid banners.
    const images = await ImageService.findByResources(
      ImageResourceType.BANNER,
      banners.map((b) => String(b.id))
    );

    return banners.map((banner) =>
      BannerPublicDtoFactory.fromEntity(
        banner,
        images.find((img) => img.resourceId === String(banner.id)) ?? null
      )
    );
  });
