import {
  ImagePurpose,
  ImageResourceType,
  ImageVariantKind
} from '~/prisma/generated/prisma/client';

import { mbToBytes } from '@/lib/utils';

interface ImageTransform {
  width?: number;
  height?: number;
  fit?: 'cover' | 'contain' | 'inside' | 'fill';
  position?: 'center' | 'top' | 'bottom' | 'left' | 'right';
}

export interface VariantSpec {
  kind: ImageVariantKind;
  transform: ImageTransform;
}

export interface ImageConfig {
  maxSize?: number;
  mimeTypes?: readonly string[];
  original: ImageTransform;
  variants?: VariantSpec[];
}

type TImagePolicy = Record<ImageResourceType, Partial<Record<ImagePurpose, ImageConfig>>>;

export const imagePolicy: TImagePolicy = {
  [ImageResourceType.AVATAR]: {
    [ImagePurpose.AVATAR_IMAGE]: {
      original: {
        width: 256,
        height: 256,
        fit: 'cover',
        position: 'center'
      },
      maxSize: mbToBytes(1),
      mimeTypes: ['image/*']
    }
  },

  [ImageResourceType.GALLERY_SECTION]: {
    [ImagePurpose.GALLERY_SECTION_IMAGE]: {
      original: {
        width: 1920,
        height: 1920
      },
      maxSize: mbToBytes(10),
      mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
      variants: [
        {
          kind: ImageVariantKind.THUMB_512x512,
          transform: { width: 512, height: 512, fit: 'cover', position: 'center' }
        },
        {
          kind: ImageVariantKind.THUMB_256x256,
          transform: { width: 256, height: 256, fit: 'cover', position: 'center' }
        }
      ]
    }
  }
};

export function getImagePolicy(resource: ImageResourceType, purpose: ImagePurpose) {
  return imagePolicy[resource]?.[purpose];
}

export function canUseImagePurpose(resource: ImageResourceType, purpose: ImagePurpose): boolean {
  return !!imagePolicy[resource]?.[purpose];
}

export function getImagePurposes(resource: ImageResourceType) {
  return Object.keys(imagePolicy[resource] ?? {}) as ImagePurpose[];
}
