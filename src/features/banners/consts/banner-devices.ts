import { ImagePurpose } from '~/prisma/generated/prisma/enums.ts';

export const bannerDevices = ['compact', 'wide'] as const;

export type BannerDevice = (typeof bannerDevices)[number];

export const bannerDevicePurpose: Record<BannerDevice, ImagePurpose> = {
  compact: ImagePurpose.BANNER_COMPACT_IMAGE,
  wide: ImagePurpose.BANNER_WIDE_IMAGE,
};

export function isBannerDevice(value: string): value is BannerDevice {
  return (bannerDevices as readonly string[]).includes(value);
}
