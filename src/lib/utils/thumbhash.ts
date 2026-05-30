import { thumbHashToDataURL } from 'thumbhash';

// Decode a base64-encoded thumbhash into a tiny PNG data URL for a blur-up
// placeholder. Returns undefined when no hash is provided.
export function thumbhashToDataUrl(thumbhash: string | null | undefined): string | undefined {
  if (!thumbhash)
    return undefined;

  const bytes = Uint8Array.from(atob(thumbhash), (c) => c.charCodeAt(0));
  return thumbHashToDataURL(bytes);
}
