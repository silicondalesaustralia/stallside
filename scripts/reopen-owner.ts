/**
 * Clear soft-delete on an owner by email (keeps data; allows normal use again).
 *
 *   npx tsx scripts/reopen-owner.ts team@ecomxseo.com
 */
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

async function main() {
  const email = (process.argv[2] ?? "").trim().toLowerCase();
  if (!email.includes("@")) {
    console.error("Usage: npx tsx scripts/reopen-owner.ts <email>");
    process.exit(1);
  }

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL missing");

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });

  try {
    const user = await prisma.user.findFirst({
      where: { email: { equals: email, mode: "insensitive" } },
      select: {
        id: true,
        email: true,
        name: true,
        owner: {
          select: {
            id: true,
            businessName: true,
            deletedAt: true,
            adAttribution: true,
          },
        },
      },
    });

    if (!user?.owner) {
      console.error("No owner found for", email);
      process.exit(1);
    }

    console.log(
      JSON.stringify(
        {
          before: {
            userId: user.id,
            email: user.email,
            ownerId: user.owner.id,
            deletedAt: user.owner.deletedAt,
            adAttribution: user.owner.adAttribution,
          },
        },
        null,
        2,
      ),
    );

    if (!user.owner.deletedAt) {
      console.log("Already open — nothing to do.");
      return;
    }

    const updated = await prisma.owner.update({
      where: { id: user.owner.id },
      data: { deletedAt: null },
      select: { id: true, deletedAt: true },
    });
    console.log("Reopened:", updated);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
