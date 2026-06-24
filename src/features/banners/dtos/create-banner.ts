import { z } from 'zod';
import { BannerState } from '~/prisma/generated/prisma/enums.ts';


// An optional click-through target. Internal paths only — external URLs
// (anything with a protocol or protocol-relative `//`) are rejected.
// The leading `/` is optional: callers normalize by prepending it when
// rendering. Empty string is allowed and normalized to null by callers.
export const bannerHrefSchema = z
  .string()
  .trim()
  .max(2048)
  .refine(
    (v) => v === '' || (!v.includes('://') && !v.startsWith('//')),
    'Link must be an internal path (no external URLs)'
  );

// `order` is server-assigned (appended) on create, never client-supplied; the
// two device images are uploaded separately via the multipart endpoint.
export const createBannerDtoSchema = z.object({
  state: z.enum(BannerState).default(BannerState.ACTIVE),
  titleRo: z.string().trim().max(256).nullish(),
  titleRu: z.string().trim().max(256).nullish(),
  href: bannerHrefSchema.nullish(),
});

export type TCreateBannerDto = z.infer<typeof createBannerDtoSchema>;

export type TCreateBannerInput = z.input<typeof createBannerDtoSchema>;
