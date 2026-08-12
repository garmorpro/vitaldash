import { PrismaClient } from "@/generated/prisma/client";

// Prevents hot-reload in dev from spawning a new PrismaClient (and a new DB
// connection pool) on every file save. This file is the ONLY place in the
// app that should import PrismaClient — everything else goes through the
// API routes in src/app/api/.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
