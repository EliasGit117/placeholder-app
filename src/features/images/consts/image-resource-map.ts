import {
  ImagePurpose,
  ImageResourceType
} from '~/prisma/generated/prisma/client';

import { mbToBytes } from '@/lib/utils';

interface ImageTransform {
  width?: number;
  height?: number;
  fit?: 'cover' | 'contain' | 'inside' | 'fill';
  position?: 'center' | 'top' | 'bottom' | 'left' | 'right';
}

export interface ImageConfig {
  maxSize?: number;
  mimeTypes?: readonly string[];
  transform?: ImageTransform;
}

type TImagePolicy = Record<ImageResourceType, Partial<Record<ImagePurpose, ImageConfig>>>;

export const imagePolicy: TImagePolicy = {
  [ImageResourceType.AVATAR]: {
    [ImagePurpose.THUMB_256x256]: {
      transform: {
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
    [ImagePurpose.BASE]: {
      transform: {
        width: 1920,
        height: 1920
      },
      maxSize: mbToBytes(10),
      mimeTypes: ['image/jpeg', 'image/png', 'image/webp']
    },
    [ImagePurpose.THUMB_512x512]: {
      transform: {
        width: 512,
        height: 512,
        fit: 'cover',
        position: 'center'
      },
      maxSize: mbToBytes(5),
      mimeTypes: ['image/jpeg', 'image/png', 'image/webp']
    },
    [ImagePurpose.THUMB_256x256]: {
      transform: {
        width: 256,
        height: 256,
        fit: 'cover',
        position: 'center'
      },
      maxSize: mbToBytes(2),
      mimeTypes: ['image/jpeg', 'image/png', 'image/webp']
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