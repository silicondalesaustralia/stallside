/**
 * Diagnose + send a test web push to an owner's registered devices.
 *
 * Usage:
 *   npm run push:test -- jono@silicondales.com
 *
 * Requires local .env with DATABASE_URL + VAPID keys (same pair as Vercel).
 * The phone must already have subscribed (Home Screen → Phone push on).
 */
import "dotenv/config";
import webpush from "web-push";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { LEGAL_EMAIL } from "../src/lib/legal";

async function main() {
  const email = (process.argv[2] ?? "jono@silicondales.com").trim().toLowerCase();
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim() ?? "";
  const privateKey = process.env.VAPID_PRIVATE_KEY?.trim() ?? "";
  const connectionString = process.env.DATABASE_URL;

  console.log("\n=== Stallside web push test ===\n");
  console.log(`Email: ${email}`);
  console.log(`VAPID public:  ${publicKey ? `set (${publicKey.length} chars)` : "MISSING"}`);
  console.log(`VAPID private: ${privateKey ? `set (${privateKey.length} chars)` : "MISSING"}`);

  if (!connectionString) {
    console.error("\nFAIL: DATABASE_URL is not set");
    process.exit(1);
  }
  if (!publicKey || !privateKey) {
    console.error("\nFAIL: Set NEXT_PUBLIC_VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY in .env");
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
      console.error("\nFAIL: No user/owner for that email");
      process.exit(1);
    }

    const owner = user.owner;
    const devices = await prisma.pushDevice.findMany({
      where: { ownerId: owner.id },
      orderBy: { updatedAt: "desc" },
    });

    console.log(`pushAlertsEnabled: ${owner.pushAlertsEnabled}`);
    console.log(`Registered devices: ${devices.length}`);
    for (const device of devices) {
      console.log(
        `  - ${device.platform}  updated ${device.updatedAt.toISOString()}  tokenChars=${device.token.length}`,
      );
    }

    if (!devices.length) {
      console.error(`
FAIL: No PushDevice rows for this owner — nothing to send to.

On the phone:
  1. Open Stallside from the Home Screen icon (iPhone requires this)
  2. Settings → Phone push alerts ON → Save → Allow notifications
  3. Re-run: npm run push:test -- ${email}
`);
      process.exit(1);
    }

    if (!owner.pushAlertsEnabled) {
      console.warn("WARN: pushAlertsEnabled is false (live sales won't push). Testing send anyway.\n");
    }

    webpush.setVapidDetails(`mailto:${LEGAL_EMAIL}`, publicKey, privateKey);

    const title = "Stallside test push";
    const body = `Sent at ${new Date().toLocaleString()}`;
    let ok = 0;
    let failed = 0;

    for (const device of devices) {
      if (device.platform !== "web") {
        console.log(`SKIP ${device.platform} (this script tests web push only)`);
        continue;
      }

      try {
        const subscription = JSON.parse(device.token) as webpush.PushSubscription;
        await webpush.sendNotification(
          subscription,
          JSON.stringify({ title, body, data: { type: "test" } }),
        );
        console.log(`OK  web device (${device.id.slice(0, 8)}…)`);
        ok += 1;
      } catch (error) {
        failed += 1;
        const status =
          error && typeof error === "object" && "statusCode" in error
            ? Number((error as { statusCode: number }).statusCode)
            : undefined;
        console.error(`FAIL web device (${device.id.slice(0, 8)}…)`, status ?? error);
        if (status === 404 || status === 410) {
          await prisma.pushDevice.delete({ where: { id: device.id } });
          console.error("  Removed stale subscription from DB — re-enable Phone push on phone.");
        }
      }
    }

    console.log(`\nDone. ok=${ok} failed=${failed}`);
    if (ok === 0) process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
