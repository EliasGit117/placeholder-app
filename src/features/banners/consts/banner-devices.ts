import { ImagePurpose } from '~/prisma/generated/prisma/enums.ts';

// A banner carries two device images: a wide 3:1 desktop image (required) and a
// 6:5 mobile image (optional). On narrow viewports the mobile image is shown via
// <picture>, falling back to the desktop image when it isn't set.
export const bannerDevices = ['desktop', 'mobile'] as const;
export type BannerDevice = (typeof bannerDevices)[number];

export const bannerImagePurposeByDevice = {
  desktop: ImagePurpose.BANNER_IMAGE,
  mobile: ImagePurpose.BANNER_IMAGE_MOBILE,
} as const satisfies Record<BannerDevice, ImagePurpose>;

// Target aspect ratio (width / height) per device.
export const bannerAspectByDevice = {
  desktop: 3 / 1,
  mobile: 6 / 5,
} as const satisfies Record<BannerDevice, number>;

// The desktop image is the primary banner image — its presence is what makes a
// banner "valid" and it's the thumbnail shown in admin lists.
export const bannerImagePurpose = bannerImagePurposeByDevice.desktop;

// Normalizes an untrusted device string (query/path param) to a known device,
// defaulting to desktop.
export function bannerDeviceFromString(value: string | null | undefined): BannerDevice {
  return value === 'mobile' ? 'mobile' : 'desktop';
}
