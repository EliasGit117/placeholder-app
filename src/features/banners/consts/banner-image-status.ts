// Public-display readiness of a banner's images. A banner is shown for a locale
// only once that locale has both its desktop (3:1) and mobile (6:5) image, and
// the artwork is per-locale — so readiness is aggregated across every locale:
//   complete — every locale has both images (shows in all languages)
//   partial  — has some images but at least one locale is missing one (won't
//              show in some language)
//   empty    — no images at all
export const bannerImageStatuses = ['complete', 'partial', 'empty'] as const;
export type BannerImageStatus = (typeof bannerImageStatuses)[number];

// Derives the aggregate status from each locale's device presence.
export function getBannerImageStatus(
  perLocale: { hasDesktop: boolean; hasMobile: boolean }[]
): BannerImageStatus {
  const anyPresent = perLocale.some((l) => l.hasDesktop || l.hasMobile);
  if (!anyPresent)
    return 'empty';

  const allComplete = perLocale.every((l) => l.hasDesktop && l.hasMobile);
  return allComplete ? 'complete' : 'partial';
}
