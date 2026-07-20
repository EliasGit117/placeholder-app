import { ImagePurpose } from '~/prisma/generated/prisma/enums.ts';
import { baseLocale, isLocale, locales, type Locale } from '@/paraglide/runtime';

// A banner carries two device images per locale: a wide 3:1 desktop image
// (required) and a 6:5 mobile image (optional). On narrow viewports the mobile
// image is shown via <picture>, falling back to the desktop image when unset.
export const bannerDevices = ['desktop', 'mobile'] as const;
export type BannerDevice = (typeof bannerDevices)[number];

// The locales a banner carries images for — mirrors the app's Paraglide locales,
// since banner artwork usually has text baked in and must differ per language.
export const bannerLocales = locales;

// Image purpose per (locale, device). The banner artwork is language-specific,
// so every locale owns its own desktop + mobile image. Keyed as
// `bannerImagePurposeByLocaleDevice[locale][device]`. The `satisfies` check
// fails to compile if a locale is added without its banner purposes.
export const bannerImagePurposeByLocaleDevice = {
  ro: {
    desktop: ImagePurpose.BANNER_IMAGE_RO,
    mobile: ImagePurpose.BANNER_IMAGE_MOBILE_RO,
  },
  ru: {
    desktop: ImagePurpose.BANNER_IMAGE_RU,
    mobile: ImagePurpose.BANNER_IMAGE_MOBILE_RU,
  },
} as const satisfies Record<Locale, Record<BannerDevice, ImagePurpose>>;

// Target aspect ratio (width / height) per device.
export const bannerAspectByDevice = {
  desktop: 3 / 1,
  mobile: 6 / 5,
} as const satisfies Record<BannerDevice, number>;

// The base-locale desktop image is the primary banner image — the thumbnail
// shown in admin lists and the fallback status reference.
export const bannerImagePurpose = bannerImagePurposeByLocaleDevice[baseLocale].desktop;

// Normalizes an untrusted device string (query/path param) to a known device,
// defaulting to desktop.
export function bannerDeviceFromString(value: string | null | undefined): BannerDevice {
  return value === 'mobile' ? 'mobile' : 'desktop';
}

// Normalizes an untrusted locale string (query/path param) to a known locale,
// defaulting to the base locale.
export function bannerLocaleFromString(value: string | null | undefined): Locale {
  return value != null && isLocale(value) ? value : baseLocale;
}
