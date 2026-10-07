/**
 * Enable Memberships nav on Alexa's Egg Stand after migration.
 *   npx jiti scripts/enable-alexa-memberships-nav.ts
 */
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

async function main() {
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
  });
  try {
    const result = await prisma.stand.updateMany({
      where: {
        slug: "alexa-s-egg-stand-2",
        owner: { user: { email: "jono@silicondales.com" } },
      },
      data: { showSubscriptionsOnStand: true },
    });
    console.log(JSON.stringify({ updated: result.count }));
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
