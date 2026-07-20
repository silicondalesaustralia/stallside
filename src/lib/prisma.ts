import { PrismaClient, PaymentMethod } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

type CachedPrisma = {
  client: PrismaClient;
  /** Bust dev HMR cache when `prisma generate` adds enum values. */
  schemaFingerprint: string;
};

const globalForPrisma = globalThis as unknown as {
  prisma?: CachedPrisma | PrismaClient;
};

const schemaFingerprint = Object.values(PaymentMethod).sort().join(",");

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}

function isCachedPrisma(value: CachedPrisma | PrismaClient): value is CachedPrisma {
  return "schemaFingerprint" in value && "client" in value;
}

function getPrismaClient() {
  const cached = globalForPrisma.prisma;
  if (cached && isCachedPrisma(cached) && cached.schemaFingerprint === schemaFingerprint) {
    return cached.client;
  }

  const previous = cached
    ? isCachedPrisma(cached)
      ? cached.client
      : cached
    : undefined;
  void previous?.$disconnect().catch(() => undefined);

  const client = createPrismaClient();
  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = { client, schemaFingerprint };
  }
  return client;
}

export const prisma = getPrismaClient();
