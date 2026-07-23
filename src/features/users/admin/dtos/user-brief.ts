import { z } from 'zod';
import type { Prisma } from '~/prisma/generated/prisma/client.ts';


type TUser = Prisma.UserGetPayload<Record<string, never>>

export const userBriefDtoSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  emailVerified: z.boolean(),
  image: z.string().optional(),
  role: z.string().optional(),
  banned: z.boolean().optional(),
  banReason: z.string().optional(),
  banExpires: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type TUserBriefDto = z.infer<typeof userBriefDtoSchema>;


export class UserBriefDtoFactory {
  static fromEntity(entity: TUser): TUserBriefDto {
    return {
      id: entity.id,
      name: entity.name,
      email: entity.email,
      emailVerified: entity.emailVerified,
      image: entity.image ?? undefined,
      role: entity.role ?? undefined,
      banned: entity.banned ?? undefined,
      banReason: entity.banReason ?? undefined,
      banExpires: entity.banExpires?.toISOString() ?? undefined,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
    };
  }

  static fromEntities(entities: TUser[]): TUserBriefDto[] {
    return entities.map((entity) => this.fromEntity(entity));
  }
}