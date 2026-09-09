import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const email = (process.argv[2] ?? "team@ecomxseo.com").trim().toLowerCase();
const mode = process.argv[3] ?? "inspect"; // inspect | reset-onboarding | purge

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      owner: {
        select: {
          id: true,
          businessName: true,
          deletedAt: true,
          onboardingCompletedAt: true,
          businessMode: true,
          createdAt: true,
          stands: { select: { id: true, slug: true, name: true } },
        },
      },
    },
  });

  console.log(JSON.stringify(user, null, 2));

  if (!user) {
    console.log("No user found.");
  }

  if (mode === "reset-onboarding" && user?.owner) {
    await prisma.owner.update({
      where: { id: user.owner.id },
      data: {
        deletedAt: null,
        onboardingCompletedAt: null,
        businessMode: null,
        sellCategories: [],
        fulfilmentIntents: [],
      },
    });
    console.log("Reset onboarding fields; next login → /onboarding wizard.");
  }

  if (mode === "purge") {
    if (user?.owner) {
      const ownerId = user.owner.id;
      // OrderItem.productId has no onDelete Cascade — clear orders first.
      await prisma.orderItem.deleteMany({
        where: { order: { ownerId } },
      });
      await prisma.order.deleteMany({ where: { ownerId } });
      await prisma.owner.delete({ where: { id: ownerId } });
      console.log("Deleted owner", ownerId);
    }
    if (user) {
      await prisma.session.deleteMany({ where: { userId: user.id } });
      await prisma.account.deleteMany({ where: { userId: user.id } });
      await prisma.user.delete({ where: { id: user.id } });
      console.log("Deleted user", user.id);
    }
    const extras = await Promise.all([
      prisma.signupIntent.deleteMany({ where: { email } }),
      prisma.waitlistEntry.deleteMany({ where: { email } }),
      prisma.verificationToken.deleteMany({ where: { identifier: email } }),
      prisma.lifetimeInviteRedemption.deleteMany({ where: { email } }),
    ]);
    console.log("Cleared related email rows", {
      signupIntent: extras[0].count,
      waitlist: extras[1].count,
      verificationToken: extras[2].count,
      inviteRedemption: extras[3].count,
    });
    console.log("Purged", email);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
