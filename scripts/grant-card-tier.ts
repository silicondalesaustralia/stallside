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
      console.error(`No owner profile for ${email}`);
      process.exit(1);
    }

    const owner = await prisma.owner.update({
      where: { id: user.owner.id },
      data: {
        subscriptionPlan: "card",
        subscriptionStatus: SubscriptionStatus.ACTIVE,
        monthlyFeeCents: 0,
      },
    });

    console.log(
      JSON.stringify(
        {
          email: user.email,
          role: user.role,
          plan: owner.subscriptionPlan,
          status: owner.subscriptionStatus,
          monthlyFeeCents: owner.monthlyFeeCents,
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
