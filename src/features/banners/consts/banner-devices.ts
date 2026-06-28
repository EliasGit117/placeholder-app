import { ImagePurpose } from '~/prisma/generated/prisma/enums.ts';

// A banner owns a single 3:1 image, stored under this purpose.
export const bannerImagePurpose = ImagePurpose.BANNER_IMAGE;
