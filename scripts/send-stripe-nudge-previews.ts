/**
 * Send Stripe nudge email previews.
 * Usage: npx tsx scripts/send-stripe-nudge-previews.ts [email]
 */
import "dotenv/config";
import {
  sendStripeNeverStartedNudge,
  sendStripeRestrictedNudge,
} from "../src/lib/lifecycle-emails";

const to = (process.argv[2] || "jono@silicondales.com").trim().toLowerCase();
const name = "Jono";

const jobs: Array<{ label: string; run: () => Promise<void> }> = [
  {
    label: "1. Stripe restricted (started but incomplete)",
    run: () =>
      sendStripeRestrictedNudge({
        to,
        name,
        missingItems: [
          "Date of birth",
          "Representative address",
          "Bank account for payouts",
        ],
      }),
  },
  {
    label: "2. Stripe never started (optional card nudge)",
    run: () => sendStripeNeverStartedNudge({ to, name }),
  },
];

async function main() {
  if (!process.env.RESEND_API_KEY) {
    console.error("RESEND_API_KEY is not set");
    process.exit(1);
  }
  console.log(`Sending ${jobs.length} Stripe nudge previews to ${to}…\n`);
  for (const job of jobs) {
    try {
      await job.run();
      console.log(`OK  ${job.label}`);
      await new Promise((r) => setTimeout(r, 400));
    } catch (error) {
      console.error(`FAIL ${job.label}`, error);
    }
  }
  console.log("\nDone.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
