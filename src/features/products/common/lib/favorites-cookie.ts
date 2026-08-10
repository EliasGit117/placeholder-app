import { z } from 'zod';
import { getCookie, setCookie } from '@orpc/server/helpers';

const FAVORITES_COOKIE = 'favorites';
export const MAX_FAVORITES = 100;

const favoriteListSchema = z.array(z.number().int().nonnegative());

export function readFavorites(headers: Headers): number[] {
  const raw = getCookie(headers, FAVORITES_COOKIE);
  if (!raw) return [];

  try {
    return favoriteListSchema.catch([]).parse(JSON.parse(raw));
  } catch {
    return [];
  }
}

export function writeFavorites(resHeaders: Headers | undefined, ids: number[]) {
  setCookie(resHeaders, FAVORITES_COOKIE, JSON.stringify(ids), {
    path: '/',
    sameSite: 'lax',
    maxAge: 31536000,
    secure: process.env.NODE_ENV === 'production',
  });
}
