import { z } from 'zod';
import { ImageVariantKind } from '~/prisma/generated/prisma/enums.ts';
import type { Prisma } from '~/prisma/generated/prisma/client.ts';

type TImageVariant = Prisma.ImageVariantGetPayload<Record<string, never>>;

export const imageVariantDtoSchema = z.object({
  id: z.number(),
  kind: z.enum(ImageVariantKind),
  url: z.string(),
  key: z.string(),
  size: z.number(),
  width: z.number(),
  height: z.number(),
  createdAt: z.string(),
});

export type TImageVariantDto = z.infer<typeof imageVariantDtoSchema>;

export class ImageVariantDtoFactory {
  static fromEntity(entity: TImageVariant): TImageVariantDto {
    return {
      id: entity.id,
      kind: entity.kind,
      url: entity.url,
      key: entity.key,
      size: entity.size,
      width: entity.width,
      height: entity.height,
      createdAt: entity.createdAt.toISOString(),
    };
  }

  static fromEntities(entities: TImageVariant[]): TImageVariantDto[] {
    return entities.map(ImageVariantDtoFactory.fromEntity);
  }
}
