/**
 * Idempotent backfill: Product → ProductChannel STAND + ONLINE on the product's stand.
 *
 * Usage: npx tsx scripts/backfill-product-channels.ts
 * One owner: npx tsx scripts/backfill-product-channels.ts fssug@outlook.com
 */
import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { ensureDefaultProductChannels } from "../src/lib/catalogue/channels";

async function main() {
  const email = process.argv[2]?.trim().toLowerCase();
  const ownerFilter = email
    ? {
        owner: { user: { email } },
      }
    : {};

  const products = await prisma.product.findMany({
    where: { isArchived: false, ...ownerFilter },
    select: { id: true, standId: true, ownerId: true },
  });

  for (const p of products) {
    await ensureDefaultProductChannels({
      productId: p.id,
      standId: p.standId,
      ownerId: p.ownerId,
    });
  }

  console.log(
    `Backfill done. products=${products.length}${email ? ` owner=${email}` : ""}`,
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
