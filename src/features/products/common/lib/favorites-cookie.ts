import { z } from 'zod';
import { createCookieStore } from '@/features/shared/lib/cookie-store.ts';

export const MAX_FAVORITES = 100;

const favoritesStore = createCookieStore('favorites', z.array(z.number().int().nonnegative()), []);

export const readFavorites = favoritesStore.read;
export const writeFavorites = favoritesStore.write;
