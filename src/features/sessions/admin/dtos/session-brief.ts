import { z } from "zod";
import type { Prisma } from '~/prisma/generated/prisma/client.ts';


export enum SessionState {
  Active = 'active',
  Expired = 'expired'
}

export const sessionStateSchema = z.enum(SessionState);
export type TSessionState = z.infer<typeof sessionStateSchema>;


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
  status: sessionStateSchema,

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
      status: entity.expiresAt < new Date() ? SessionState.Expired : SessionState.Active,
    };
  }

  static fromEntities(entities: TSessionWithUser[], options?: ISessionBriefDtoFactoryOptions): TSessionBriefDto[] {
    return entities.map((entity) =>
      this.fromEntity(entity, options)
    );
  }
}