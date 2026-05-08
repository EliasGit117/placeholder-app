import { PrismaPg } from '@prisma/adapter-pg';
import { pagination } from 'prisma-extension-pagination';
import { slowQueryLogger } from '@/lib/db/extensions/slow-query-logger.ts';
import { PrismaClient } from '~/prisma/generated/prisma/client.ts';


export function createPrismaClient() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });

  return new PrismaClient({ adapter })
    .$extends(pagination())
    .$extends(slowQueryLogger);
}