/**
 * Feature announcement (Customer Choice, QR editor, product photos).
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
import {
  FEATURE_ANNOUNCE_SUBJECT,
  sendFeatureAnnounce,
} from "../src/lib/lifecycle-emails/feature-announce";

const PREVIEW_DEFAULT = "jono@silicondales.com";

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

async function sendPreview(to: string) {
  console.log(`Preview → ${to}`);
  console.log(`Subject: ${FEATURE_ANNOUNCE_SUBJECT}\n`);
  await sendFeatureAnnounce({ to, name: "Jono" });
  console.log("OK preview sent.");
}

async function sendAll(except: Set<string>, lifetime: boolean) {
  const owners = await prisma.owner.findMany({
    where: { lifetimeAccess: lifetime, deletedAt: null },
    include: { user: { select: { email: true, name: true } } },
  });

  const seen = new Set<string>();
  let ok = 0;
  let skip = 0;
  let fail = 0;
  const audience = lifetime ? "lifetime" : "non-lifetime";

  console.log(
    `Broadcast to ${owners.length} ${audience} owners (deduped by email, except ${except.size})…\n`,
  );

  for (const owner of owners) {
    const r = recipientFromOwner(owner);
    if (!r || seen.has(r.to) || except.has(r.to)) {
      if (r && except.has(r.to)) console.log(`SKIP ${r.to}`);
      skip += 1;
      continue;
    }
    seen.add(r.to);
    try {
      await sendFeatureAnnounce(r);
      ok += 1;
      console.log(`OK  ${r.to}`);
      await new Promise((res) => setTimeout(res, 400));
    } catch (error) {
      fail += 1;
      console.error(`FAIL ${r.to}`, error);
    }
  }

  console.log(`\nDone. sent=${ok} skipped=${skip} failed=${fail}`);
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
