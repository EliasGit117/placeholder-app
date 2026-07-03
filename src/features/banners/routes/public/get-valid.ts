import { z } from 'zod';
import { ImageResourceType } from '~/prisma/generated/prisma/enums.ts';
import { getLocale } from '@/paraglide/runtime';
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
    // Banners are valid (and their images resolved) for the request's locale —
    // the artwork is language-specific.
    const locale = getLocale();
    const banners = await BannerService.findAllValid(locale);
    if (banners.length === 0)
      return [];

    // One query for every banner's images (all locales + devices); the factory
    // buckets them by resource id + purpose — avoids an N+1 across the banners.
    const images = await ImageService.findByResources(
      ImageResourceType.BANNER,
      banners.map((b) => String(b.id))
    );

    return BannerPublicDtoFactory.fromEntities(banners, images, locale);
  });
