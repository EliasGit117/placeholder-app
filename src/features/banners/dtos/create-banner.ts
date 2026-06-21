import { z } from 'zod';
import { BannerState, BannerStyle, BannerXAlign, BannerYAlign } from '~/prisma/generated/prisma/enums.ts';


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
// three device images are uploaded separately via the multipart endpoint.
export const createBannerDtoSchema = z.object({
  state: z.enum(BannerState).default(BannerState.ACTIVE),
  titleRo: z.string().trim().max(256).nullish(),
  titleRu: z.string().trim().max(256).nullish(),
  descriptionRo: z.string().trim().max(2048).nullish(),
  descriptionRu: z.string().trim().max(2048).nullish(),
  href: bannerHrefSchema.nullish(),
  mobileXAlign: z.enum(BannerXAlign).default(BannerXAlign.LEFT),
  mobileYAlign: z.enum(BannerYAlign).default(BannerYAlign.BOTTOM),
  tabletXAlign: z.enum(BannerXAlign).default(BannerXAlign.LEFT),
  tabletYAlign: z.enum(BannerYAlign).default(BannerYAlign.BOTTOM),
  desktopXAlign: z.enum(BannerXAlign).default(BannerXAlign.LEFT),
  desktopYAlign: z.enum(BannerYAlign).default(BannerYAlign.BOTTOM),
  mobileStyle: z.enum(BannerStyle).default(BannerStyle.LIGHT),
  tabletStyle: z.enum(BannerStyle).default(BannerStyle.LIGHT),
  desktopStyle: z.enum(BannerStyle).default(BannerStyle.LIGHT),
});

export type TCreateBannerDto = z.infer<typeof createBannerDtoSchema>;

// Pre-default input shape (every field optional) — what a create form binds to,
// since the defaults are only applied on parse.
export type TCreateBannerInput = z.input<typeof createBannerDtoSchema>;
