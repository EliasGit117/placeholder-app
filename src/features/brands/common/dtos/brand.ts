import { z } from 'zod';
import type { Brand } from '~/prisma/generated/prisma/client.ts';


export const brandDtoSchema = z.object({
  id: z.number(),
  nameRo: z.string(),
  nameRu: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const brandDtosSchema = z.array(brandDtoSchema);

export type TBrandDto = z.infer<typeof brandDtoSchema>;

export class BrandDtoFactory {

  static fromEntity(entity: Brand): TBrandDto {
    return {
      id: entity.id,
      nameRo: entity.nameRo,
      nameRu: entity.nameRu,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
    };
  }

  static fromEntities(entities: Brand[]): TBrandDto[] {
    return entities.map(BrandDtoFactory.fromEntity);
  }
}
