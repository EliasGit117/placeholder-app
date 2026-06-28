// Public-display readiness of a banner's images. A banner needs both the
// desktop (3:1) and mobile (6:5) image to be shown publicly; anything else is a
// problem the admin can filter/track on.
export const bannerImageStatuses = ['none', 'missing_desktop', 'missing_mobile', 'missing_all'] as const;
export type BannerImageStatus = (typeof bannerImageStatuses)[number];

export function getBannerImageStatus(hasDesktop: boolean, hasMobile: boolean): BannerImageStatus {
  if (hasDesktop && hasMobile)
    return 'none';
  if (!hasDesktop && !hasMobile)
    return 'missing_all';
  return hasDesktop ? 'missing_mobile' : 'missing_desktop';
}
