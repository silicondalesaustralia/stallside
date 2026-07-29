/**
 * Send one sample of each lifecycle email for preview.
 * Usage: npx tsx scripts/send-lifecycle-previews.ts [email]
 */
import "dotenv/config";
import {
  sendTrialWelcome,
  sendTrialDay7,
  sendTrialDay14,
  sendTrialDay28,
  sendTrialDay30,
  sendCashWelcome,
  sendCashUpgradeDay2,
  sendCashUpgradeDay7,
  sendCashUpgradeDay14,
  sendCardWelcome,
  sendFirstTenOrdersEmail,
} from "../src/lib/lifecycle-emails";

const to = (process.argv[2] || "jono@silicondales.com").trim().toLowerCase();
const name = "Jono";
const recipient = { to, name, businessName: "Jono's Stand" };

const jobs: Array<{ label: string; run: () => Promise<void> }> = [
  { label: "1. Trial welcome (Day 0)", run: () => sendTrialWelcome(recipient) },
  { label: "2. Trial Day 7", run: () => sendTrialDay7(recipient) },
  { label: "3. Trial Day 14", run: () => sendTrialDay14(recipient) },
  { label: "4. Trial Day 28", run: () => sendTrialDay28(recipient) },
  { label: "5. Trial Day 30 (ended)", run: () => sendTrialDay30(recipient) },
  { label: "6. Cash welcome", run: () => sendCashWelcome(recipient) },
  { label: "7. Cash→Card Day 2", run: () => sendCashUpgradeDay2(recipient) },
  { label: "8. Cash→Card Day 7", run: () => sendCashUpgradeDay7(recipient) },
  { label: "9. Cash→Card Day 14", run: () => sendCashUpgradeDay14(recipient) },
  { label: "10. Card welcome", run: () => sendCardWelcome(recipient) },
  {
    label: "11. First 10 orders",
    run: () => sendFirstTenOrdersEmail({ to, name }),
  },
];

async function main() {
  if (!process.env.RESEND_API_KEY) {
    console.error("RESEND_API_KEY is not set");
    process.exit(1);
  }
  console.log(`Sending ${jobs.length} preview emails to ${to}…\n`);
  for (const job of jobs) {
    try {
      await job.run();
      console.log(`OK  ${job.label}`);
      // Small pause so Resend doesn't rate-limit a burst
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
