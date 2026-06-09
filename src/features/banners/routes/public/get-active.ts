import { z } from 'zod';
import { ImageResourceType } from '~/prisma/generated/prisma/enums.ts';
import { getLocale } from '@/paraglide/runtime';
import { bannersPublicBase, bannersPublicPath } from './base.ts';
import { BannerService } from '../../services/banner-service.ts';
import { ImageService } from '@/features/images/services/image-service.ts';
import { BannerPublicDtoFactory } from '@/features/banners/dtos/banner-public.ts';
import { BannerImagesDtoFactory } from '@/features/banners/dtos/banner-image.ts';
import {
  bannerPublicWithImagesDtoSchema,
  type TBannerPublicWithImagesDto,
} from '@/features/banners/dtos/banner-with-images.ts';

export const publicBannersGetActive = bannersPublicBase
  .route({
    method: 'GET',
    path: bannersPublicPath,
    summary: 'List active banners',
    description: 'Returns active banners in display order, each with its localized text and device images',
  })
  .meta({ anonymous: true })
  .output(z.array(bannerPublicWithImagesDtoSchema))
  .handler(async () => {
    const locale = getLocale();
    const banners = await BannerService.findAllActive();
    if (banners.length === 0)
      return [];

    // One query for every banner's images, then bucket by resource id — avoids
    // an N+1 across the active banners.
    const images = await ImageService.findByResources(
      ImageResourceType.BANNER,
      banners.map((b) => String(b.id))
    );

    return banners.map((banner): TBannerPublicWithImagesDto => ({
      banner: BannerPublicDtoFactory.fromEntity(banner, locale),
      images: BannerImagesDtoFactory.fromImageDtos(
        images.filter((img) => img.resourceId === String(banner.id))
      ),
    }));
  });
