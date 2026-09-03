/**
 * Backfill VENDL_SUBDOMAIN StorefrontDomain rows for existing storefronts.
 * Usage: npx tsx scripts/backfill-storefront-domains.ts
 */
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { APP_DOMAIN } from "../src/lib/constants";
import { isReservedVendlSubdomain } from "../src/lib/tenancy/reserved-subdomains";

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
  const prisma = new PrismaClient({ adapter });

  const storefronts = await prisma.storefront.findMany({
    select: { id: true, slug: true, isPublished: true },
  });

  let created = 0;
  let skipped = 0;
  const conflicts: string[] = [];

  for (const sf of storefronts) {
    const slug = sf.slug.trim().toLowerCase();
    if (isReservedVendlSubdomain(slug)) {
      conflicts.push(`reserved:${slug}`);
      skipped++;
      continue;
    }
    const hostname = `${slug}.${APP_DOMAIN}`;
    const existing = await prisma.storefrontDomain.findUnique({
      where: { hostname },
    });
    if (existing) {
      skipped++;
      continue;
    }
    const hasPrimary = await prisma.storefrontDomain.findFirst({
      where: { storefrontId: sf.id, isPrimary: true },
    });
    await prisma.storefrontDomain.create({
      data: {
        storefrontId: sf.id,
        hostname,
        type: "VENDL_SUBDOMAIN",
        status: "ACTIVE",
        isPrimary: !hasPrimary,
        activatedAt: new Date(),
        verifiedAt: new Date(),
      },
    });
    created++;
  }

  console.log(
    JSON.stringify({ created, skipped, conflicts, total: storefronts.length }, null, 2),
  );
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
