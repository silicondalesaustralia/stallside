/**
 * Send journey emails for review (Resend directly, [PREVIEW] subject prefix, no send records).
 * Usage: npx tsx scripts/send-journey-previews.ts <email> [key1,key2,...]
 */
import "dotenv/config";
import { cleanEnvSecret } from "../src/lib/env";
import { JONO_REPLY_TO, jonoFrom } from "../src/lib/lifecycle-emails/html";
import { LIFECYCLE_UNSUB_PLACEHOLDER, lifecycleUnsubLinks } from "../src/lib/lifecycle-emails/unsubscribe";
import { journeyEmail } from "../src/lib/lifecycle-emails/journeys/catalog";
import { doneForYouLive } from "../src/lib/lifecycle-emails/journeys/config";
import { renderJourneyEmail } from "../src/lib/lifecycle-emails/journeys/render";

const to = process.argv[2];
const keys = (process.argv[3] ?? "free_d00,recovery_d07,pro_d00").split(",");

async function send(key: string): Promise<void> {
  const email = journeyEmail(key);
  if (!email) throw new Error(`Unknown journey email ${key}`);
  const apiKey = cleanEnvSecret(process.env.RESEND_API_KEY);
  if (!apiKey) throw new Error("RESEND_API_KEY is not set");
  const html = renderJourneyEmail(email, { name: "Jono", currency: "AUD", dfyLive: doneForYouLive() });
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: jonoFrom(),
      to: [to],
      reply_to: JONO_REPLY_TO,
      subject: `[PREVIEW] ${email.subject}`,
      html: html.replaceAll(LIFECYCLE_UNSUB_PLACEHOLDER, lifecycleUnsubLinks(to).page),
    }),
  });
  if (!res.ok) throw new Error(`${key}: ${res.status} ${await res.text()}`);
  console.log(`sent ${key}: ${email.subject}`);
}

async function main(): Promise<void> {
  if (!to?.includes("@")) throw new Error("Usage: npx tsx scripts/send-journey-previews.ts <email> [keys]");
  for (const key of keys) await send(key.trim());
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
