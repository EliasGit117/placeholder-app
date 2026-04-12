import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from '~/prisma/generated/prisma/client';
import { serverEnvConfig } from '@/lib/config/server-env-config';


const adapter = new PrismaPg({
  connectionString: serverEnvConfig.dbUrl
});

function createPrismaClient() {
  const client = new PrismaClient({
    adapter: adapter,
    log: [
      { emit: "event", level: "query" },
      { emit: "stdout", level: "error" },
      { emit: "stdout", level: "info" },
      { emit: "stdout", level: "warn" }
    ],
  });

  client.$on("query", (event) => {
    console.log("Query: " + event.query);
    console.log("Params: " + event.params);
    console.log("Duration: " + event.duration + "ms");
  });

  return client;
}

declare global {
  var __prisma: PrismaClient | undefined;
}

export const prisma = globalThis.__prisma || createPrismaClient();

if (!serverEnvConfig.isProduction) {
  globalThis.__prisma = prisma;
}
