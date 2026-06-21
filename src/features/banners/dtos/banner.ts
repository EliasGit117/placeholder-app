import { z } from 'zod';
import type { Banner } from '~/prisma/generated/prisma/client.ts';
import { BannerState, BannerStyle, BannerXAlign, BannerYAlign } from '~/prisma/generated/prisma/enums.ts';


export const bannerDtoSchema = z.object({
  id: z.number(),
  order: z.number(),
  state: z.enum(BannerState),
  titleRo: z.string().nullish(),
  titleRu: z.string().nullish(),
  descriptionRo: z.string().nullish(),
  descriptionRu: z.string().nullish(),
  href: z.string().nullish(),
  mobileXAlign: z.enum(BannerXAlign),
  mobileYAlign: z.enum(BannerYAlign),
  tabletXAlign: z.enum(BannerXAlign),
  tabletYAlign: z.enum(BannerYAlign),
  desktopXAlign: z.enum(BannerXAlign),
  desktopYAlign: z.enum(BannerYAlign),
  mobileStyle: z.enum(BannerStyle),
  tabletStyle: z.enum(BannerStyle),
  desktopStyle: z.enum(BannerStyle),
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
      descriptionRo: entity.descriptionRo,
      descriptionRu: entity.descriptionRu,
      href: entity.href,
      mobileXAlign: entity.mobileXAlign,
      mobileYAlign: entity.mobileYAlign,
      tabletXAlign: entity.tabletXAlign,
      tabletYAlign: entity.tabletYAlign,
      desktopXAlign: entity.desktopXAlign,
      desktopYAlign: entity.desktopYAlign,
      mobileStyle: entity.mobileStyle,
      tabletStyle: entity.tabletStyle,
      desktopStyle: entity.desktopStyle,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
    };
  }

  static fromEntities(entities: Banner[]): TBannerDto[] {
    return entities.map(BannerDtoFactory.fromEntity);
  }
}
