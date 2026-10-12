import { APP_NAME } from "@/lib/constants";
import { sendOwnerEmail } from "@/lib/notify-email";
import {
  JONO_REPLY_TO,
  emailShell,
  greetName,
  jonoFrom,
} from "@/lib/lifecycle-emails/html";

type Recipient = { to: string; name: string; showPaymentNudge?: boolean };

export const CREATOR_DAY3_SUBJECT = `A quick note from Jono at ${APP_NAME}`;

export function creatorDay3Html(name: string, showPaymentNudge = false): string {
  const paymentBlock = showPaymentNudge
    ? `<p>One thing worth knowing: if you want card, Apple Pay, Google Pay, or
      Tap &amp; Go at checkout, connect Square (if you're in AU) or Stripe when
      you're ready. Square syncs your existing inventory automatically. Cash
      and bank payments work fine without either. There's no rush.</p>`
    : "";

  return emailShell(
    CREATOR_DAY3_SUBJECT,
    `
      <p>Hi ${greetName(name)},</p>
      <p>I'm Jono, co-founder of ${APP_NAME}.</p>
      <p>${APP_NAME} started because I kept meeting small producers (bakers, home
      cooks, farm gate sellers) who were running their whole operation out of
      DMs, spreadsheets, and three different apps that didn't talk to each
      other. No small business is identical, so I built ${APP_NAME} to be
      flexible enough to fit how you actually work.</p>
      ${paymentBlock}
      <p>If there's a feature you want, or something in ${APP_NAME} that needs
      improving for how you work, reply to this email and tell me. I read every
      reply personally, and we ship updates every week, so if it's a real need,
      it usually gets built.</p>
      <p>Regards,</p>
      <p>Jono @ ${APP_NAME}</p>
    `,
    `What ${APP_NAME} is, and how to reach me.`,
  );
}

/** Day 3 after signup: personal note from the founder. */
export async function sendCreatorDay3(r: Recipient) {
  await sendOwnerEmail(
    r.to,
    CREATOR_DAY3_SUBJECT,
    creatorDay3Html(r.name, r.showPaymentNudge),
    {
      from: jonoFrom(),
      replyTo: JONO_REPLY_TO,
      kind: "lifecycle_creator_day3",
    },
  );
}
