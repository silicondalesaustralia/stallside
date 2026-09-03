import "dotenv/config";
import { PrismaClient, SubscriptionStatus } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

async function main() {
  const email = (process.argv[2] ?? "team@ecomxseo.com").trim().toLowerCase();
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("DATABASE_URL is not set");
    process.exit(1);
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { owner: true },
    });
    if (!user?.owner) {
      console.error(`No owner profile for ${email}`);
      process.exit(1);
    }

    const before = {
      plan: user.owner.subscriptionPlan,
      status: user.owner.subscriptionStatus,
      lifetime: user.owner.lifetimeAccess,
    };

    const owner = await prisma.owner.update({
      where: { id: user.owner.id },
      data: {
        lifetimeAccess: true,
        subscriptionPlan: "pro",
        subscriptionStatus: SubscriptionStatus.ACTIVE,
        monthlyFeeCents: 0,
      },
    });

    console.log(
      JSON.stringify(
        {
          email: user.email,
          dbHostHint: connectionString.replace(/:[^:@/]+@/, ":****@").slice(0, 80),
          before,
          after: {
            plan: owner.subscriptionPlan,
            status: owner.subscriptionStatus,
            lifetime: owner.lifetimeAccess,
          },
        },
        null,
        2,
      ),
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
