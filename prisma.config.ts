import "dotenv/config";
import { defineConfig } from "prisma/config";

// Prefer a direct (non-pooler) URL for migrate — Neon pooler + advisory locks often P1002.
const databaseUrl =
  process.env.DIRECT_DATABASE_URL ??
  process.env.DATABASE_URL_UNPOOLED ??
  process.env.DATABASE_URL ??
  "postgresql://prisma:prisma@127.0.0.1:5432/prisma?schema=public";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: databaseUrl,
  },
});
