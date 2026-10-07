/**
 * Feature announcement broadcast.
 *
 * Preview (default):
 *   npx tsx scripts/send-feature-announce.ts
 *   npx tsx scripts/send-feature-announce.ts jono@silicondales.com
 *
 * Broadcast to all non-lifetime owners (excludes lifetimeAccess):
 *   npx tsx scripts/send-feature-announce.ts --all
 * Broadcast to lifetime / free-for-life owners:
 *   npx tsx scripts/send-feature-announce.ts --lifetime --except jaijou@yahoo.com
 */
import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { demoStandSlugs } from "../src/lib/demo";
import { COUNTED_STATUSES } from "../src/lib/order-metrics";
import {
  FEATURE_ANNOUNCE_SUBJECT,
  sendFeatureAnnounce,
} from "../src/lib/lifecycle-emails/feature-announce";

// Always use production links in this mail, even when run from a local .env.
process.env.NEXT_PUBLIC_APP_URL = "https://vendl.app";

const PREVIEW_DEFAULT = "jono@silicondales.com";

/** Extra addresses included once with --all (not required to be owners). */
const EXTRA_BROADCAST_RECIPIENTS: Array<{ to: string; name: string }> = [
  { to: "jonathan@csmgdigital.com", name: "Jonathan" },
];

/** Always skipped on broadcast (in addition to owners with sales). */
const HARD_EXCEPT_EMAILS = new Set([
  "ljwaters.80@gmail.com",
]);
/** Owners with >=1 counted sale (demo stands ignored). */
async function emailsWithSales(): Promise<Set<string>> {
  const demoSlugs = [...demoStandSlugs()];
  const sellers = await prisma.order.groupBy({
    by: ["ownerId"],
    where: {
      paymentStatus: { in: COUNTED_STATUSES },
      ...(demoSlugs.length
        ? { stand: { slug: { notIn: demoSlugs } } }
        : {}),
    },
  });
  if (!sellers.length) return new Set();

  const owners = await prisma.owner.findMany({
    where: { id: { in: sellers.map((s) => s.ownerId) }, deletedAt: null },
    include: { user: { select: { email: true } } },
  });

  const emails = new Set<string>();
  for (const owner of owners) {
    const to = (owner.user?.email || owner.contactEmail || "")
      .trim()
      .toLowerCase();
    if (to.includes("@")) emails.add(to);
  }
  return emails;
}
function recipientFromOwner(owner: {
  contactEmail: string;
  businessName: string;
  user: { email: string | null; name: string | null } | null;
}) {
  const to = (owner.user?.email || owner.contactEmail || "").trim().toLowerCase();
  if (!to.includes("@")) return null;
  return {
    to,
    name: owner.user?.name || owner.businessName || "there",
  };
}

async function sendOne(
  r: { to: string; name: string },
  seen: Set<string>,
  except: Set<string>,
  counters: { ok: number; skip: number; fail: number },
) {
  if (seen.has(r.to) || except.has(r.to)) {
    if (except.has(r.to)) console.log(`SKIP ${r.to}`);
    counters.skip += 1;
    return;
  }
  seen.add(r.to);
  try {
    await sendFeatureAnnounce(r);
    counters.ok += 1;
    console.log(`OK  ${r.to}`);
    await new Promise((res) => setTimeout(res, 400));
  } catch (error) {
    counters.fail += 1;
    console.error(`FAIL ${r.to}`, error);
  }
}

async function sendPreview(to: string) {
  console.log(`Preview → ${to}`);
  console.log(`Subject: ${FEATURE_ANNOUNCE_SUBJECT}\n`);
  await sendFeatureAnnounce({ to, name: "Jono" });
  console.log("OK preview sent.");
}

async function sendAll(except: Set<string>, lifetime: boolean) {
  const sellers = await emailsWithSales();
  for (const email of sellers) except.add(email);
  for (const email of HARD_EXCEPT_EMAILS) except.add(email);

  const owners = await prisma.owner.findMany({
    where: { lifetimeAccess: lifetime, deletedAt: null },
    include: { user: { select: { email: true, name: true } } },
  });

  const seen = new Set<string>();
  const counters = { ok: 0, skip: 0, fail: 0 };
  const audience = lifetime ? "lifetime" : "non-lifetime";

  console.log(
    `Broadcast to ${owners.length} ${audience} owners (deduped by email; except ${except.size} incl. ${sellers.size} with sales)…\n`,
  );

  for (const owner of owners) {
    const r = recipientFromOwner(owner);
    if (!r) {
      counters.skip += 1;
      continue;
    }
    await sendOne(r, seen, except, counters);
  }

  // Extras ride with the main (--all) pass so they are not double-sent with --lifetime.
  if (!lifetime) {
    for (const extra of EXTRA_BROADCAST_RECIPIENTS) {
      const r = { to: extra.to.trim().toLowerCase(), name: extra.name };
      console.log(`EXTRA ${r.to}`);
      await sendOne(r, seen, except, counters);
    }
  }

  console.log(
    `\nDone. sent=${counters.ok} skipped=${counters.skip} failed=${counters.fail}`,
  );
}

function parseExcept(args: string[]): Set<string> {
  const except = new Set<string>();
  for (let i = 0; i < args.length; i += 1) {
    if (args[i] !== "--except") continue;
    const email = (args[i + 1] ?? "").trim().toLowerCase();
    if (email.includes("@")) except.add(email);
  }
  return except;
}

async function main() {
  if (!process.env.RESEND_API_KEY) {
    console.error("RESEND_API_KEY is not set");
    process.exit(1);
  }

  const args = process.argv.slice(2);
  if (args.includes("--all") || args.includes("--lifetime")) {
    await sendAll(parseExcept(args), args.includes("--lifetime"));
    return;
  }

  const to = (args[0] || PREVIEW_DEFAULT).trim().toLowerCase();
  await sendPreview(to);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
