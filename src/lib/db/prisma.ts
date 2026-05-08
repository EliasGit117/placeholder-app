import { createPrismaClient } from '@/lib/db/create-client.ts';


export type TPrismaExtendedClient = ReturnType<typeof createPrismaClient>;
export type TxClient = Omit<TPrismaExtendedClient, '$connect' | '$disconnect' | '$transaction' | '$extends'>;

declare global {
  var __prisma: TPrismaExtendedClient | undefined;
}

export const prisma =
  globalThis.__prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma;
}

