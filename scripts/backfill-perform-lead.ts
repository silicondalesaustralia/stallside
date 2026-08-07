/**
 * Backfill a Perform "lead" conversion for a missed signup pixel fire.
 *
 *   npx tsx scripts/backfill-perform-lead.ts tummies@outlook.com.au
 *   npx tsx scripts/backfill-perform-lead.ts tummies@outlook.com.au --dry-run
 */
import "dotenv/config";
import { createHash, randomUUID } from "crypto";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  attributionToClickIds,
  normalizeAttribution,
} from "../src/lib/ad-attribution";

const ORG_ID = "59c53b3e-428d-4dd9-8b4d-5c34aa938818";
const SITE_ID = "all";
const CONVERT_URL =
  "https://perform-by-silicondales.vercel.app/api/attribution/convert";
const COLLECT_URL =
  "https://perform-by-silicondales.vercel.app/api/attribution/collect";

async function main() {
  const args = process.argv.slice(2).filter((a) => a !== "--dry-run");
  const dryRun = process.argv.includes("--dry-run");
  const emailArg = args[0]?.trim().toLowerCase();
  if (!emailArg) {
    console.error("Usage: npx tsx scripts/backfill-perform-lead.ts <email>");
    process.exit(1);
  }

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL missing");

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });

  try {
    const user = await prisma.user.findFirst({
      where: { email: { equals: emailArg, mode: "insensitive" } },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        owner: {
          select: {
            id: true,
            businessName: true,
            createdAt: true,
            adAttribution: true,
          },
        },
      },
    });

    if (!user?.email) {
      console.error("User not found:", emailArg);
      process.exit(1);
    }

    const email = user.email.trim().toLowerCase();
    const emailHash = createHash("sha256").update(email).digest("hex");
    const occurredAt = user.createdAt.toISOString();
    const conversionId = `signup_backfill_${user.id}`;
    const visitorId = `backfill_${user.id}`;
    const sessionId = randomUUID();
    const adAttribution = normalizeAttribution(user.owner?.adAttribution);
    const clickIds = attributionToClickIds(adAttribution);

    const identifyPayload = {
      orgId: ORG_ID,
      siteId: SITE_ID,
      eventType: "identify",
      occurredAt,
      visitorId,
      sessionId,
      pageUrl: "https://vendl.app/signup-complete",
      metadata: {
        emailHash,
        identifySource: "backfill",
        userId: user.id,
      },
    };

    const convertPayload = {
      orgId: ORG_ID,
      siteId: SITE_ID,
      conversionId,
      conversionType: "lead",
      occurredAt,
      value: 50,
      currency: "AUD",
      visitorId,
      sessionId,
      emailHash,
      orderKeys: [],
      productIds: [],
      clickIds,
      metadata: {
        pageUrl: "https://vendl.app/signup-complete",
        source: "backfill",
        userId: user.id,
        email,
        name: user.name,
      },
    };

    console.log(
      JSON.stringify(
        {
          user: {
            id: user.id,
            email,
            name: user.name,
            createdAt: occurredAt,
            ownerId: user.owner?.id,
          },
          emailHash,
          conversionId,
          clickIds,
          adAttribution,
          dryRun,
        },
        null,
        2,
      ),
    );

    if (dryRun) {
      console.log("Dry run — not posting to Perform.");
      return;
    }

    const identifyRes = await fetch(COLLECT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(identifyPayload),
    });
    const identifyText = await identifyRes.text();
    console.log("identify:", identifyRes.status, identifyText.slice(0, 500));

    const convertRes = await fetch(CONVERT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(convertPayload),
    });
    const convertText = await convertRes.text();
    console.log("convert:", convertRes.status, convertText.slice(0, 500));

    if (!identifyRes.ok || !convertRes.ok) {
      process.exit(1);
    }

    console.log("Backfilled Perform lead for", email);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
