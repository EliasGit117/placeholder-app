import { z } from 'zod';
import type { Banner } from '~/prisma/generated/prisma/client.ts';
import { BannerState } from '~/prisma/generated/prisma/enums.ts';


export const bannerDtoSchema = z.object({
  id: z.number(),
  order: z.number(),
  state: z.enum(BannerState),
  titleRo: z.string().nullish(),
  titleRu: z.string().nullish(),
  href: z.string().nullish(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type TBannerDto = z.infer<typeof bannerDtoSchema>;

export class BannerDtoFactory {

  static fromEntity(entity: Banner): TBannerDto {
    return {
      id: entity.id,
      order: entity.order,
      state: entity.state,
      titleRo: entity.titleRo,
      titleRu: entity.titleRu,
      href: entity.href,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
    };
  }

  static fromEntities(entities: Banner[]): TBannerDto[] {
    return entities.map(BannerDtoFactory.fromEntity);
  }
}
