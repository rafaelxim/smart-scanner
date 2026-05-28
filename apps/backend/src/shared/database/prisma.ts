import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@prisma/client";

export type AppPrismaClient = PrismaClient;
export type PrismaTransaction = Parameters<Parameters<PrismaClient["$transaction"]>[0]>[0];

export function createPrismaClient(databaseUrl: string): PrismaClient {
  const adapter = new PrismaMariaDb(databaseUrl);
  return new PrismaClient({ adapter });
}
