/**
 * Retrospectively send Day 0 welcome to all owners (ignores trialWelcomeSentAt).
 * Usage: NEXT_PUBLIC_APP_URL=https://stallside.app npx tsx scripts/send-retrospective-welcome.ts
 */
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { sendTrialWelcome } from "../src/lib/lifecycle-emails";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

async function main() {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not set");
  }

  const owners = await prisma.owner.findMany({
    include: { user: { select: { email: true, name: true } } },
    orderBy: { createdAt: "asc" },
  });

  console.log(`Sending welcome to ${owners.length} owner(s)…\n`);

  let ok = 0;
  let skip = 0;
  let fail = 0;

  for (const owner of owners) {
    const to = (owner.user?.email || owner.contactEmail || "").trim().toLowerCase();
    if (!to.includes("@")) {
      console.log(`SKIP  ${owner.id} (no email)`);
      skip += 1;
      continue;
    }
    const name = owner.user?.name || owner.businessName;
    try {
      await sendTrialWelcome({ to, name, businessName: owner.businessName });
      console.log(`OK    ${to}`);
      ok += 1;
      await new Promise((r) => setTimeout(r, 400));
    } catch (error) {
      console.error(`FAIL  ${to}`, error);
      fail += 1;
    }
  }

  console.log(`\nDone. ok=${ok} skip=${skip} fail=${fail}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
