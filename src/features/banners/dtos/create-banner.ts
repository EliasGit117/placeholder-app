import { z } from 'zod';
import { BannerState, BannerXAlign, BannerYAlign } from '~/prisma/generated/prisma/enums.ts';


// An optional click-through target. Internal path only (must start with a
// single `/`) — external links with a domain are intentionally rejected.
// Empty string is allowed and normalized to null by callers.
export const bannerHrefSchema = z
  .string()
  .trim()
  .max(2048)
  .refine(
    (v) => v === '' || (v.startsWith('/') && !v.startsWith('//')),
    'Link must be an internal path starting with /'
  );

// `order` is server-assigned (appended) on create, never client-supplied; the
// three device images are uploaded separately via the multipart endpoint.
export const createBannerDtoSchema = z.object({
  state: z.enum(BannerState).default(BannerState.active),
  titleRo: z.string().trim().max(256).nullish(),
  titleRu: z.string().trim().max(256).nullish(),
  descriptionRo: z.string().trim().max(2048).nullish(),
  descriptionRu: z.string().trim().max(2048).nullish(),
  href: bannerHrefSchema.nullish(),
  mobileXAlign: z.enum(BannerXAlign).default(BannerXAlign.LEFT),
  mobileYAlign: z.enum(BannerYAlign).default(BannerYAlign.CENTER),
  tabletXAlign: z.enum(BannerXAlign).default(BannerXAlign.LEFT),
  tabletYAlign: z.enum(BannerYAlign).default(BannerYAlign.CENTER),
  desktopXAlign: z.enum(BannerXAlign).default(BannerXAlign.LEFT),
  desktopYAlign: z.enum(BannerYAlign).default(BannerYAlign.CENTER),
});

export type TCreateBannerDto = z.infer<typeof createBannerDtoSchema>;

// Pre-default input shape (every field optional) — what a create form binds to,
// since the defaults are only applied on parse.
export type TCreateBannerInput = z.input<typeof createBannerDtoSchema>;
