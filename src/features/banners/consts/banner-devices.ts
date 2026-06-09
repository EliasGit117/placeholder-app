import { ImagePurpose } from '~/prisma/generated/prisma/enums.ts';

// A banner has one art-directed image per breakpoint. `device` is the public,
// URL/UI-facing name; each maps to a single-cardinality ImagePurpose on the
// shared Image table (resourceType BANNER, resourceId = banner id).
export const bannerDevices = ['mobile', 'tablet', 'desktop'] as const;

export type BannerDevice = (typeof bannerDevices)[number];

export const bannerDevicePurpose: Record<BannerDevice, ImagePurpose> = {
  mobile: ImagePurpose.BANNER_MOBILE_IMAGE,
  tablet: ImagePurpose.BANNER_TABLET_IMAGE,
  desktop: ImagePurpose.BANNER_DESKTOP_IMAGE,
};

export function isBannerDevice(value: string): value is BannerDevice {
  return (bannerDevices as readonly string[]).includes(value);
}
