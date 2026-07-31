/**
 * Send one sample of each lifecycle email for preview.
 * Usage: npx tsx scripts/send-lifecycle-previews.ts [email]
 */
import "dotenv/config";
import {
  sendTrialWelcome,
  sendTrialDay7,
  sendTrialDay14,
  sendTrialDay23,
  sendTrialDay30,
  sendTrialDay45,
  sendCardWelcome,
  sendProLapseDay0,
  sendProLapseDay23,
  sendProLapseDay45,
  sendFirstTenOrdersEmail,
  sendCancellationFeedback,
} from "../src/lib/lifecycle-emails";

const to = (process.argv[2] || "jono@silicondales.com").trim().toLowerCase();
const name = "Jono";
const recipient = { to, name, businessName: "Jono's Stand" };

const jobs: Array<{ label: string; run: () => Promise<void> }> = [
  { label: "1. Trial welcome (Day 0)", run: () => sendTrialWelcome(recipient) },
  { label: "2. Trial Day 7", run: () => sendTrialDay7(recipient) },
  { label: "3. Trial Day 14", run: () => sendTrialDay14(recipient) },
  { label: "4. Trial Day 23", run: () => sendTrialDay23(recipient) },
  { label: "5. Trial Day 30 (ended)", run: () => sendTrialDay30(recipient) },
  {
    label: "6. Trial Day 45",
    run: () => sendTrialDay45(recipient, { cardInterestCount: 5, restockCount: 3 }),
  },
  { label: "7. Pro welcome", run: () => sendCardWelcome(recipient) },
  { label: "8. Pro lapse Day 0", run: () => sendProLapseDay0(recipient) },
  { label: "9. Pro lapse Day 23", run: () => sendProLapseDay23(recipient) },
  {
    label: "10. Pro lapse Day 45",
    run: () => sendProLapseDay45(recipient, { cardInterestCount: 12, restockCount: 8 }),
  },
  {
    label: "11. First 10 orders",
    run: () => sendFirstTenOrdersEmail({ to, name }),
  },
  {
    label: "12. Cancel feedback",
    run: () => sendCancellationFeedback({ to, name }),
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
