import { z } from 'zod';
import { ImagePurpose, ImageResourceType, ImageVariantKind } from '~/prisma/generated/prisma/enums.ts';

export const createImageVariantSchema = z.object({
  kind: z.enum(ImageVariantKind),
  url: z.string().url(),
  key: z.string().min(1),
  customId: z.string().optional(),
  generatedId: z.string().min(1),
  name: z.string().min(1),
  size: z.number().int().positive(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
});

export const createImageSchema = z.object({
  url: z.string().url(),
  key: z.string().min(1),
  customId: z.string().optional(),
  generatedId: z.string().min(1),
  name: z.string().min(1),
  size: z.number().int().positive(),
  mimeType: z.string().min(1),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  thumbhash: z.string().optional(),
  resourceType: z.enum(ImageResourceType),
  resourceId: z.string().optional(),
  purpose: z.enum(ImagePurpose),
  variants: z.array(createImageVariantSchema).optional(),
});

export type TCreateImageVariantInput = z.infer<typeof createImageVariantSchema>;
export type TCreateImageInput = z.infer<typeof createImageSchema>;
