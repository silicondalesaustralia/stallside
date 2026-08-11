import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

async function main() {
  const id = process.argv[2] ?? "cms4q47cn000104liyou4p4w0";
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL missing");

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });

  try {
    const owner = await prisma.owner.findUnique({
      where: { id },
      include: {
        user: { select: { email: true, name: true, role: true } },
        stands: { select: { id: true, name: true, slug: true } },
      },
    });
    if (!owner) {
      console.error("Owner not found:", id);
      process.exit(1);
    }

    console.log(
      JSON.stringify(
        {
          id: owner.id,
          businessName: owner.businessName,
          email: owner.user.email,
          subscriptionPlan: owner.subscriptionPlan,
          subscriptionStatus: owner.subscriptionStatus,
          monthlyFeeCents: owner.monthlyFeeCents,
          billingCurrency: owner.billingCurrency,
          lifetimePaidCents: owner.lifetimePaidCents,
          stripeCustomerId: owner.stripeCustomerId,
          stripeSubscriptionId: owner.stripeSubscriptionId,
          subscriptionStartedAt: owner.subscriptionStartedAt,
          trialEndsAt: owner.trialEndsAt,
          lifetimeAccess: owner.lifetimeAccess,
          currentPeriodEndsAt: owner.currentPeriodEndsAt,
          cancelAtPeriodEnd: owner.cancelAtPeriodEnd,
          stands: owner.stands,
        },
        null,
        2,
      ),
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
