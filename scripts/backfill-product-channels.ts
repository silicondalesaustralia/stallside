/**
 * Idempotent backfill: Product → ProductChannel STAND (+ ONLINE on primary).
 *
 * Usage: npx tsx scripts/backfill-product-channels.ts
 */
import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { ProductChannelType } from "../src/generated/prisma/client";

async function primaryByOwner() {
  const stands = await prisma.stand.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true, ownerId: true },
  });
  const map = new Map<string, string>();
  for (const s of stands) {
    if (!map.has(s.ownerId)) map.set(s.ownerId, s.id);
  }
  return map;
}

async function main() {
  const primary = await primaryByOwner();
  const products = await prisma.product.findMany({
    select: { id: true, standId: true, ownerId: true },
  });

  let standRows = 0;
  let onlineRows = 0;

  for (const p of products) {
    await prisma.productChannel.upsert({
      where: {
        productId_channelType_standId: {
          productId: p.id,
          channelType: ProductChannelType.STAND,
          standId: p.standId,
        },
      },
      create: {
        productId: p.id,
        channelType: ProductChannelType.STAND,
        standId: p.standId,
        isEnabled: true,
      },
      update: {},
    });
    standRows += 1;

    if (primary.get(p.ownerId) === p.standId) {
      await prisma.productChannel.upsert({
        where: {
          productId_channelType_standId: {
            productId: p.id,
            channelType: ProductChannelType.ONLINE,
            standId: p.standId,
          },
        },
        create: {
          productId: p.id,
          channelType: ProductChannelType.ONLINE,
          standId: p.standId,
          isEnabled: true,
        },
        update: {},
      });
      onlineRows += 1;
    }
  }

  console.log(
    `Backfill done. products=${products.length} standChannels=${standRows} onlineChannels=${onlineRows}`,
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
