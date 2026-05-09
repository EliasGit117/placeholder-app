import { z } from "zod";
import type { Prisma } from '~/prisma/generated/prisma/client.ts';

type TSessionWithUser = Prisma.SessionGetPayload<{ include: { user: true } }>

export const sessionBriefDtoSchema = z.object({
  id: z.string(),

  user: z.object({
    id: z.string(),
    email: z.string(),
    name: z.string(),
  }).optional(),

  userId: z.string(),
  userAgent: z.string().optional(),
  token: z.string(),
  ipAddress: z.string().optional(),
  isCurrent: z.boolean().optional(),
  isOwned: z.boolean().optional(),
  isExpired: z.boolean().optional(),

  createdAt: z.string(),
  updatedAt: z.string(),
  expiresAt: z.string(),
});

export type TSessionBriefDto = z.infer<typeof sessionBriefDtoSchema>;


interface ISessionBriefDtoFactoryOptions {
  currentSessionId?: string;
  currentUserId?: string;
}

export class SessionBriefDtoFactory {
  static fromEntity(entity: TSessionWithUser, options?: ISessionBriefDtoFactoryOptions): TSessionBriefDto {
    return {
      id: entity.id,
      userId: entity.userId,
      user: entity.user ? {
        id: entity.user.id,
        email: entity.user.email,
        name: entity.user.name,
      } : undefined,
      token: entity.token,
      ipAddress: entity.ipAddress ?? undefined,
      userAgent: entity.userAgent ?? undefined,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
      expiresAt: entity.expiresAt.toISOString(),
      isCurrent: options?.currentSessionId != null ? entity.id === options.currentSessionId : undefined,
      isOwned: options?.currentUserId != null ? entity.userId === options.currentUserId : undefined,
      isExpired: entity.expiresAt < new Date(),
    };
  }

  static fromEntities(entities: TSessionWithUser[], options?: ISessionBriefDtoFactoryOptions): TSessionBriefDto[] {
    return entities.map((entity) =>
      this.fromEntity(entity, options)
    );
  }
}