import { z } from 'zod';
import type { Banner } from '~/prisma/generated/prisma/client.ts';


export const bannerPublicDtoSchema = z.object({
  id: z.number(),
  order: z.number(),
  href: z.string().nullish(),
});

export type TBannerPublicDto = z.infer<typeof bannerPublicDtoSchema>;

export class BannerPublicDtoFactory {

  static fromEntity(entity: Banner): TBannerPublicDto {
    return {
      id: entity.id,
      order: entity.order,
      href: entity.href ?? undefined,
    };
  }

  static fromEntities(entities: Banner[]): TBannerPublicDto[] {
    return entities.map(BannerPublicDtoFactory.fromEntity);
  }
}
