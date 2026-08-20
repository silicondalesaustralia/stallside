/**
 * Send sample lifecycle emails for preview.
 * Usage: npx tsx scripts/send-lifecycle-previews.ts [email]
 */
import "dotenv/config";
import {
  sendTrialWelcome,
  sendCreatorDay3,
  sendCardWelcome,
  sendProLapseDay23,
  sendProLapseDay45,
  sendFirstTenOrdersEmail,
  sendCancellationFeedback,
} from "../src/lib/lifecycle-emails";
import { sendFeatureAnnounce } from "../src/lib/lifecycle-emails/feature-announce";

const to = (process.argv[2] || "jono@silicondales.com").trim().toLowerCase();
const name = "Jono";
const recipient = { to, name, businessName: "Jono's Stand" };

const jobs: Array<{ label: string; run: () => Promise<void> }> = [
  { label: "1. Welcome (Free signup)", run: () => sendTrialWelcome(recipient) },
  { label: "2. Creator Day 3", run: () => sendCreatorDay3(recipient) },
  { label: "3. Pro welcome (after subscribe)", run: () => sendCardWelcome(recipient) },
  { label: "4. Pro lapse Day 23", run: () => sendProLapseDay23(recipient) },
  {
    label: "5. Pro lapse Day 45",
    run: () => sendProLapseDay45(recipient, { cardInterestCount: 12, restockCount: 8 }),
  },
  {
    label: "6. First 10 orders milestone",
    run: () => sendFirstTenOrdersEmail({ to, name }),
  },
  {
    label: "7. Cancel feedback",
    run: () => sendCancellationFeedback({ to, name }),
  },
  {
    label: "8. Feature announce",
    run: () => sendFeatureAnnounce(recipient),
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
