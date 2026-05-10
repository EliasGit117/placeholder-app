import { z } from 'zod';


export const createUserSchema = z.object({
  name: z.string().trim().min(2).max(128),
  email: z.string().trim().email(),
  role: z.enum(['user', 'admin'] as const),
  password: z.string().trim().min(8).max(128),
});

export type TCreateUser = z.infer<typeof createUserSchema>;


export const updateUserSchema = z.object({
  name: z.string().trim().min(2).max(128).optional(),
  email: z.string().trim().email().optional(),
  role: z.enum(['user', 'admin'] as const).optional(),
  emailVerified: z.boolean().optional(),
  password: z.union([z.string().trim().min(8).max(128), z.literal('')]).optional(),
});

export type TUpdateUser = z.infer<typeof updateUserSchema>;
