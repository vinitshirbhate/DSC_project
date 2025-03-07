import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";

declare global {
  var __prisma: PrismaClient | undefined;
}

export const getPrismaClient = (databaseUrl: string): PrismaClient => {
  if (!globalThis.__prisma) {
    globalThis.__prisma = new PrismaClient({
      datasourceUrl: databaseUrl,
    }).$extends(withAccelerate()) as unknown as PrismaClient;
  }
  return globalThis.__prisma;
};
