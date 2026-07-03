import { ImagePurpose, ImageResourceType, ImageVariantKind } from '~/prisma/generated/prisma/enums.ts';

import { mbToBytes } from '@/lib/utils';

export interface ImageTransform {
  width?: number;
  height?: number;
  fit?: 'cover' | 'contain' | 'inside' | 'fill';
  position?: 'center' | 'top' | 'bottom' | 'left' | 'right';
}

// A policy is the render spec for the stored image (extends ImageTransform) plus
// its upload constraints and any derived thumbnails. Each variant is the same
// render spec tagged with its kind.
export interface ImageConfig extends ImageTransform {
  // At most one image per (resource, purpose) scope (e.g. avatar, a hero) vs.
  // many (e.g. a gallery).
  multiple: boolean;
  maxSize?: number;
  mimeTypes?: readonly string[];
  variants?: (ImageTransform & { kind: ImageVariantKind })[];
}

// Keyed by [resourceType][purpose]: resourceType is the owner (also the column
// images are filtered/grouped by), purpose is the role its image plays. One
// resource can host several purposes — e.g. product -> thumb / hero / gallery —
// each with its own dimensions, cardinality and variants. An absent pair means
// that purpose is not allowed for that resource.
export const imagePolicy: Record<ImageResourceType, Partial<Record<ImagePurpose, ImageConfig>>> = {
  AVATAR: {
    AVATAR_IMAGE: {
      multiple: false,
      maxSize: mbToBytes(1),
      mimeTypes: ['image/*'],
      width: 256,
      height: 256,
      fit: 'cover',
    },
  },
  PRODUCT_VARIANT: {
    PRODUCT_VARIANT_IMAGE: {
      multiple: true,
      maxSize: mbToBytes(10),
      mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
      width: 1920,
      height: 1920,
      variants: [
        { kind: ImageVariantKind.THUMB_512x512, width: 512, height: 512, fit: 'cover' },
        { kind: ImageVariantKind.THUMB_256x256, width: 256, height: 256, fit: 'cover' },
      ],
    },
  },

  BANNER: {
    // Desktop banner (3:1), per locale — artwork has baked-in text so each
    // language owns its own image. Cropped to 3:1 via fit: 'cover'. No
    // thumbnails: the full image is used everywhere.
    BANNER_IMAGE_RO: {
      multiple: false,
      maxSize: mbToBytes(10),
      mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
      width: 3840,
      height: 1280,
      fit: 'cover',
      variants: [],
    },
    BANNER_IMAGE_RU: {
      multiple: false,
      maxSize: mbToBytes(10),
      mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
      width: 3840,
      height: 1280,
      fit: 'cover',
      variants: [],
    },
    // Mobile banner (6:5), per locale — an optional override shown on narrow
    // viewports.
    BANNER_IMAGE_MOBILE_RO: {
      multiple: false,
      maxSize: mbToBytes(10),
      mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
      width: 1500,
      height: 1250,
      fit: 'cover',
      variants: [],
    },
    BANNER_IMAGE_MOBILE_RU: {
      multiple: false,
      maxSize: mbToBytes(10),
      mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
      width: 1500,
      height: 1250,
      fit: 'cover',
      variants: [],
    },
  },
};

export function getImagePolicy(
  resource: ImageResourceType,
  purpose: ImagePurpose
): ImageConfig | undefined {
  return imagePolicy[resource]?.[purpose];
}

export interface ImageUploadConstraints {
  // Comma-separated MIME list for the file picker / dropzone, matching what the
  // server will actually accept. Falls back to all images when unconstrained.
  accept: string;
  maxSize?: number;
}

// Client-facing upload constraints derived from a policy, so the picker and
// dropzone enforce exactly the same rules the server validates against.
export function getImageUploadConstraints(
  resource: ImageResourceType,
  purpose: ImagePurpose
): ImageUploadConstraints {
  const policy = imagePolicy[resource]?.[purpose];
  return {
    accept: policy?.mimeTypes?.join(',') ?? 'image/*',
    maxSize: policy?.maxSize,
  };
}
