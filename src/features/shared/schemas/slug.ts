import { z } from 'zod';

export const slugSchema = z.string().trim().min(1).max(128).regex(
  /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  'Slug must be lowercase letters, numbers and hyphens only',
);
