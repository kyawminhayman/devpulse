import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// For Prisma v7, you need to create the adapter differently
export const prisma = globalForPrisma.prisma || (() => {
  if (process.env.DATABASE_URL) {
    const pool = new Pool({ 
      connectionString: process.env.DATABASE_URL,
    });
    const adapter = new PrismaPg(pool);
    return new PrismaClient({ adapter });
  }
  return new PrismaClient();
})();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;