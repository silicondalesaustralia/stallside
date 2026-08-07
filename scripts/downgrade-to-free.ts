import "dotenv/config";
import { PrismaClient, SubscriptionStatus } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

async function main() {
  const email = (process.argv[2] ?? "jono@silicondales.com").trim().toLowerCase();
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
      console.error(`No owner for ${email}`);
      process.exit(1);
    }

    const before = {
      plan: user.owner.subscriptionPlan,
      status: user.owner.subscriptionStatus,
      trialEndsAt: user.owner.trialEndsAt,
      lifetimeAccess: user.owner.lifetimeAccess,
      stripeSubscriptionId: user.owner.stripeSubscriptionId,
    };

    const updated = await prisma.owner.update({
      where: { id: user.owner.id },
      data: {
        subscriptionPlan: "free",
        subscriptionStatus: SubscriptionStatus.NONE,
        trialEndsAt: null,
        lifetimeAccess: false,
        monthlyFeeCents: 0,
        cancelAtPeriodEnd: false,
        currentPeriodEndsAt: null,
        stripeSubscriptionId: null,
        proLapsedAt: new Date(),
      },
    });

    console.log("Before:", before);
    console.log("After:", {
      plan: updated.subscriptionPlan,
      status: updated.subscriptionStatus,
      trialEndsAt: updated.trialEndsAt,
      lifetimeAccess: updated.lifetimeAccess,
      stripeSubscriptionId: updated.stripeSubscriptionId,
    });
    console.log(
      `Downgraded ${email} to Free. Card sales now take Vendl fee (2.5%).`,
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
