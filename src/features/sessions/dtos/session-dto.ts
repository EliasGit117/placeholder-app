import { type Session } from '~/prisma/generated/prisma/client.ts';
import { z } from 'zod';


export const sessionDtoSchema = z.object({
  id: z.string(),
  userId: z.string(),
  ipAddress: z.string().nullable(),
  userAgent: z.string().nullable(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  expiresAt: z.iso.datetime(),
  isCurrent: z.boolean().optional(),
  isMine: z.boolean().optional(),
  expired: z.boolean(),
});

export type TSessionDto = z.infer<typeof sessionDtoSchema>;

interface ISessionDtoFactoryOptions {
  currentSessionId?: string;
  currentUserId?: string;
}

export class SessionDtoFactory {
  static fromEntity(entity: Session, options?: ISessionDtoFactoryOptions): TSessionDto {
    return {
      id: entity.id,
      userId: entity.userId,
      ipAddress: entity.ipAddress,
      userAgent: entity.userAgent,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
      expiresAt: entity.expiresAt.toISOString(),
      isCurrent: options?.currentSessionId != null ? entity.id === options.currentSessionId : undefined,
      isMine: options?.currentUserId != null ? entity.userId === options.currentUserId : undefined,
      expired: entity.expiresAt < new Date(),
    };
  }

  static fromEntities(entities: Session[], options?: ISessionDtoFactoryOptions): TSessionDto[] {
    return entities.map((entity) =>
      this.fromEntity(entity, options)
    );
  }
}