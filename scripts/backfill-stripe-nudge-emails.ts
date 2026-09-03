/**
 * One-off backfill for Stripe Connect nudge emails.
 *
 * Usage:
 *   npx tsx scripts/backfill-stripe-nudge-emails.ts           # preview list
 *   npx tsx scripts/backfill-stripe-nudge-emails.ts --send    # send + mark sent
 */
import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { getStripe, isStripeConfigured } from "../src/lib/stripe";
import { summarizeStripeRequirements } from "../src/lib/stripe-requirements-summary";
import { recipient } from "../src/lib/lifecycle-emails/cron-helpers";
import { sendStripeNeverStartedNudge } from "../src/lib/lifecycle-emails/stripe-never-started";
import { sendStripeRestrictedNudge } from "../src/lib/lifecycle-emails/stripe-restricted";
import { markSent } from "../src/lib/lifecycle-emails/cron-helpers";

const send = process.argv.includes("--send");

type Row = {
  kind: "restricted" | "never-started";
  ownerId: string;
  email: string;
  name: string;
  businessName: string;
  stripeAccountId: string | null;
  detail: string;
};

async function loadRestrictedRows(): Promise<Row[]> {
  const owners = await prisma.owner.findMany({
    where: {
      deletedAt: null,
      stripeAccountId: { not: null },
      stripeChargesEnabled: false,
      stripeRestrictedNudgeSentAt: null,
    },
    include: {
      user: { select: { email: true, name: true } },
    },
    orderBy: { businessName: "asc" },
  });

  const rows: Row[] = [];
  for (const owner of owners) {
    const r = recipient(owner);
    if (!r) continue;

    let missing: string[] = [];
    if (isStripeConfigured() && owner.stripeAccountId) {
      try {
        const account = await getStripe().accounts.retrieve(owner.stripeAccountId);
        missing = summarizeStripeRequirements(account);
      } catch {
        missing = [];
      }
    }

    rows.push({
      kind: "restricted",
      ownerId: owner.id,
      email: r.to,
      name: r.name,
      businessName: owner.businessName,
      stripeAccountId: owner.stripeAccountId,
      detail:
        missing.length > 0
          ? `Still needed: ${missing.join(", ")}`
          : "Started Connect, charges not enabled",
    });
  }
  return rows;
}

async function loadNeverStartedRows(): Promise<Row[]> {
  const owners = await prisma.owner.findMany({
    where: {
      deletedAt: null,
      stripeAccountId: null,
      stripeNeverStartedNudgeSentAt: null,
      stands: { some: {} },
      products: { some: { isArchived: false } },
    },
    include: {
      user: { select: { email: true, name: true } },
      _count: { select: { stands: true, products: true } },
    },
    orderBy: { businessName: "asc" },
  });

  const rows: Row[] = [];
  for (const owner of owners) {
    const r = recipient(owner);
    if (!r) continue;
    rows.push({
      kind: "never-started",
      ownerId: owner.id,
      email: r.to,
      name: r.name,
      businessName: owner.businessName,
      stripeAccountId: null,
      detail: `${owner._count.stands} stand(s), ${owner._count.products} product(s), Stripe never connected`,
    });
  }
  return rows;
}

function printRows(label: string, rows: Row[]) {
  console.log(`\n## ${label} (${rows.length})\n`);
  if (rows.length === 0) {
    console.log("(none)\n");
    return;
  }
  for (const row of rows) {
    console.log(`- ${row.email}`);
    console.log(`  name: ${row.name}`);
    console.log(`  business: ${row.businessName}`);
    console.log(`  ownerId: ${row.ownerId}`);
    if (row.stripeAccountId) console.log(`  stripe: ${row.stripeAccountId}`);
    console.log(`  ${row.detail}`);
    console.log("");
  }
}

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set");
    process.exit(1);
  }
  if (send && !process.env.RESEND_API_KEY) {
    console.error("RESEND_API_KEY is not set (required for --send)");
    process.exit(1);
  }

  const [restricted, neverStarted] = await Promise.all([
    loadRestrictedRows(),
    loadNeverStartedRows(),
  ]);

  console.log(send ? "SENDING Stripe nudge backfill…" : "DRY RUN — no emails will be sent");
  console.log(`Use --send to deliver ${restricted.length + neverStarted.length} email(s).\n`);

  printRows("Restricted (finish Stripe setup)", restricted);
  printRows("Never started (optional Connect)", neverStarted);

  console.log("Summary:");
  console.log(`  restricted:     ${restricted.length}`);
  console.log(`  never-started:  ${neverStarted.length}`);
  console.log(`  total:          ${restricted.length + neverStarted.length}`);

  if (!send) return;

  let restrictedSent = 0;
  let neverStartedSent = 0;
  const now = new Date();

  for (const row of restricted) {
    let missingItems: string[] = [];
    if (isStripeConfigured() && row.stripeAccountId) {
      try {
        const account = await getStripe().accounts.retrieve(row.stripeAccountId);
        missingItems = summarizeStripeRequirements(account);
      } catch (error) {
        console.error(`FAIL restricted requirements ${row.email}`, error);
      }
    }
    try {
      await sendStripeRestrictedNudge({
        to: row.email,
        name: row.name,
        missingItems,
      });
      await markSent(row.ownerId, "stripeRestrictedNudgeSentAt", now);
      restrictedSent += 1;
    } catch (error) {
      console.error(`FAIL restricted ${row.email}`, error);
    }
    await new Promise((r) => setTimeout(r, 400));
  }

  for (const row of neverStarted) {
    try {
      await sendStripeNeverStartedNudge({ to: row.email, name: row.name });
      await markSent(row.ownerId, "stripeNeverStartedNudgeSentAt", now);
      neverStartedSent += 1;
    } catch (error) {
      console.error(`FAIL never-started ${row.email}`, error);
    }
    await new Promise((r) => setTimeout(r, 400));
  }

  console.log(`\nSent restricted: ${restrictedSent}/${restricted.length}`);
  console.log(`Sent never-started: ${neverStartedSent}/${neverStarted.length}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
