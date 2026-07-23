import type { ImagePurpose, ImageResourceType, ImageVariantKind } from '~/prisma/generated/prisma/enums.ts';

// A human-readable identifier derived from what we know about an image at upload
// time. Doubles as the UploadThing `customId`, so it must be globally unique and
// never reused.
//
// The scope slug (resourceType:resourceId:purpose) is NOT unique on its own:
// even single-cardinality purposes (avatar, banner) are replaced by deleting the
// old image and uploading a new one under the same scope. UploadThing keeps a
// `customId` reserved after deletion (deletes are eventually consistent), so a
// deterministic slug collides on the next upload with `409 File already exists`.
// Always append a short random suffix so every upload gets a fresh customId, e.g.
// `AVATAR:12:AVATAR_IMAGE:x7f3a9`, `PRODUCT_VARIANT:7:PRODUCT_VARIANT_IMAGE:x7f3a9`.
// The value is persisted (Image.generatedId) and never recomputed for lookup, so
// it doesn't need to be predictable.

interface GeneratedIdParams {
  resourceType: ImageResourceType;
  resourceId?: string | null;
  purpose: ImagePurpose;
}

const SEPARATOR = ':';

// 6 hex chars (~16M) from a fresh UUID — plenty within a single resource scope.
function randomSuffix(): string {
  return crypto.randomUUID().replace(/-/g, '').slice(0, 6);
}

export function buildImageGeneratedId(params: GeneratedIdParams): string {
  const base = [params.resourceType, params.resourceId ?? 'na', params.purpose].join(SEPARATOR);
  return `${base}${SEPARATOR}${randomSuffix()}`;
}

// A variant's id hangs off its parent image's id plus the variant kind, so it's
// deterministic and unique whenever the parent is.
export function buildVariantGeneratedId(imageGeneratedId: string, kind: ImageVariantKind): string {
  return `${imageGeneratedId}${SEPARATOR}${kind}`;
}
