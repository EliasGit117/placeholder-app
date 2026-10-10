import { getLocale } from '@/paraglide/runtime';
import { brandsBase, brandsPath } from './base.ts';
import { BrandService } from '@/features/brands/common/services/brand-service.ts';
import { BrandPublicDtoFactory, brandPublicDtosSchema } from '@/features/brands/public/dtos/brand-public.ts';

export const getAllBrands = brandsBase
  .route({
    method: 'GET',
    path: brandsPath,
    summary: 'Get brands',
    description: 'Returns localized brands that have at least one active product, sorted by name',
  })
  .meta({ anonymous: true })
  .output(brandPublicDtosSchema)
  .handler(async () => {
    const locale = getLocale();
    const entities = await BrandService.findAllWithActiveProducts(locale);
    return BrandPublicDtoFactory.fromEntities(entities, locale);
  });
