/**
 * Report lifecycle email timestamps for all owners (check before retrospective welcome).
 * Usage: npx tsx scripts/report-lifecycle-email-state.ts
 */
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

const emailFields = [
  "trialWelcomeSentAt",
  "trialDay7SentAt",
  "trialDay14SentAt",
  "trialDay23SentAt",
  "trialDay28SentAt",
  "trialDay45SentAt",
  "trialReminderSentAt",
  "cardWelcomeSentAt",
  "proLapsedAt",
  "proLapseDay0SentAt",
  "proLapseDay23SentAt",
  "proLapseDay45SentAt",
  "cancelFeedbackSentAt",
  "firstTenOrdersEmailSentAt",
] as const;

async function main() {
  const owners = await prisma.owner.findMany({
    include: { user: { select: { email: true, name: true } } },
    orderBy: { createdAt: "asc" },
  });

  console.log(`DATABASE (host hint): ${(process.env.DATABASE_URL ?? "").replace(/:[^:@/]+@/, ":****@").slice(0, 80)}…`);
  console.log(`Total owners: ${owners.length}\n`);

  let anyLifecycle = 0;
  let welcomeNull = 0;

  for (const o of owners) {
    const sent = emailFields.filter((f) => o[f] != null);
    if (sent.length > 0) anyLifecycle += 1;
    if (!o.trialWelcomeSentAt) welcomeNull += 1;

    console.log("---");
    console.log(o.user?.email || o.contactEmail);
    console.log(`  name: ${o.user?.name || o.businessName}`);
    console.log(
      `  status: ${o.subscriptionStatus} plan: ${o.subscriptionPlan} lifetime: ${o.lifetimeAccess}`,
    );
    console.log(
      `  created: ${o.createdAt.toISOString()} trialEnds: ${o.trialEndsAt?.toISOString() ?? "null"}`,
    );
    console.log(`  stripeSub: ${o.stripeSubscriptionId ? "yes" : "no"}`);
    console.log(
      `  lifecycle timestamps: ${sent.length ? sent.join(", ") : "(none)"}`,
    );
  }

  console.log(`\nOwners with ANY lifecycle timestamp: ${anyLifecycle}/${owners.length}`);
  console.log(`trialWelcomeSentAt still null: ${welcomeNull}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
