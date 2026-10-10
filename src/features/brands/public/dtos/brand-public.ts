import { z } from 'zod';
import type { Brand } from '~/prisma/generated/prisma/client.ts';
import { capitalizeFirst } from '@/lib/utils';
import type { Locale } from '@/paraglide/runtime';


// A brand on the public shop, already localized for the request's locale.
export const brandPublicDtoSchema = z.object({
  id: z.number(),
  name: z.string(),
});

export const brandPublicDtosSchema = z.array(brandPublicDtoSchema);

export type TBrandPublicDto = z.infer<typeof brandPublicDtoSchema>;

export class BrandPublicDtoFactory {

  static fromEntity(entity: Brand, locale: Locale): TBrandPublicDto {
    return {
      id: entity.id,
      name: entity[`name${capitalizeFirst(locale)}`],
    };
  }

  static fromEntities(entities: Brand[], locale: Locale): TBrandPublicDto[] {
    return entities.map((entity) => BrandPublicDtoFactory.fromEntity(entity, locale));
  }
}
