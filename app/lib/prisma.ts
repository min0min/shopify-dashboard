import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@/app/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const tursoUrl = process.env.TURSO_DATABASE_URL;
const tursoAuthToken = process.env.TURSO_AUTH_TOKEN;

// Dynamically imported so the native libsql binding is never loaded
// (and never needs to resolve for the current platform) unless Turso is configured.
const adapter = tursoUrl
  ? new (await import("@prisma/adapter-libsql")).PrismaLibSql({
      url: tursoUrl,
      authToken: tursoAuthToken,
    })
  : new PrismaBetterSqlite3({ url: process.env.DATABASE_URL ?? "file:./dev.db" });

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
