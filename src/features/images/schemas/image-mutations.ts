import { z } from 'zod';
import { ImagePurpose, ImageResourceType } from '~/prisma/generated/prisma/enums.ts';

export const createImageSchema = z.object({
  url: z.string().url(),
  key: z.string().min(1),
  size: z.number().int().positive(),
  mimeType: z.string().min(1),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  thumbhash: z.string().optional(),
  resourceType: z.enum(ImageResourceType),
  resourceId: z.number().int().optional(),
  purpose: z.enum(ImagePurpose),
});

export type TCreateImageInput = z.infer<typeof createImageSchema>;
