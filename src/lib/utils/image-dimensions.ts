// Reads the intrinsic pixel dimensions of an image file in the browser, before
// upload. Prefers `createImageBitmap` (fast, decodes off the main thread) and
// falls back to an <img> + object URL where it's unavailable.
export async function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  if (typeof createImageBitmap === 'function') {
    const bitmap = await createImageBitmap(file);
    try {
      return { width: bitmap.width, height: bitmap.height };
    } finally {
      bitmap.close();
    }
  }

  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const dims = { width: img.naturalWidth, height: img.naturalHeight };
      URL.revokeObjectURL(url);
      resolve(dims);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not read image dimensions'));
    };
    img.src = url;
  });
}

const ASPECT_3_1 = 3 / 1;

// True when width/height is within `tolerance` of 3:1. Tolerance is a relative
// fraction of the target ratio, so ~0.02 allows a couple percent of rounding.
export function isAspect3by1(width: number, height: number, tolerance = 0.02): boolean {
  if (width <= 0 || height <= 0)
    return false;

  return Math.abs(width / height - ASPECT_3_1) <= ASPECT_3_1 * tolerance;
}
