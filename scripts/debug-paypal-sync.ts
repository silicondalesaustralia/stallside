import dotenv from "dotenv";
dotenv.config({ override: true });
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  lookupMerchantByTrackingId,
  getMerchantIntegrationStatus,
  merchantPaymentsReady,
} from "../src/lib/paypal-connect";

async function main() {
  const standId = process.argv[2] ?? "cmtavw04q0001ets3eg01bqk4";
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
  });

  try {
    const stand = await prisma.stand.findUnique({
      where: { id: standId },
      include: { owner: { include: { user: { select: { email: true } } } } },
    });
    if (!stand) {
      console.error("Stand not found:", standId);
      process.exit(1);
    }

    const owner = stand.owner;
    console.log("Owner:", owner.user.email);
    console.log("tracking_id (owner.id):", owner.id);
    console.log("DB paypalMerchantId:", owner.paypalMerchantId);
    console.log("DB onboarding:", owner.paypalOnboardingComplete);
    console.log("DB paymentsEnabled:", owner.paypalPaymentsEnabled);
    console.log("Partner ID env:", process.env.PAYPAL_PARTNER_MERCHANT_ID);

    try {
      const looked = await lookupMerchantByTrackingId(owner.id);
      console.log("Lookup result:", JSON.stringify(looked, null, 2));
      const merchantId = looked.merchant_id;
      if (merchantId) {
        const status = await getMerchantIntegrationStatus(merchantId);
        console.log("Status:", JSON.stringify(status, null, 2));
        console.log("Ready:", merchantPaymentsReady(status));
      }
    } catch (error) {
      console.error("PayPal lookup/status failed:", error);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
