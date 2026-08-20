import { APP_DISPLAY_NAME, APP_NAME } from "@/lib/constants";
import { sendOwnerEmail } from "@/lib/notify-email";
import {
  emailShell,
  greetName,
} from "@/lib/lifecycle-emails/html";

type Recipient = { to: string; name: string };

/** Personal inbox so replies reach Jono. */
const CREATOR_REPLY_TO = "jono@silicondales.com";

export const CREATOR_DAY3_SUBJECT = `A quick note from Jono at ${APP_NAME}`;

export function creatorDay3Html(name: string): string {
  return emailShell(
    CREATOR_DAY3_SUBJECT,
    `
      <p>Hi ${greetName(name)},</p>
      <p>I&apos;m Jono, creator of ${APP_NAME}.</p>
      <p>We&apos;ve found that many small business owners - whether farm stand
      owners, bakers, or other businesses - need different features and options
      within ${APP_NAME} - no small business is identical.</p>
      <p>If there is a feature in ${APP_NAME} you want, or a feature that needs
      improving for you, we can provide that solution for you.</p>
      <p>Feel free to reach out to me by replying to this email
      (I read all of them personally) if there is something you need, or
      something you think we can improve.</p>
      <p>Regards,</p>
      <p>Jono @ ${APP_DISPLAY_NAME}</p>
    `,
  );
}

/** Day 3 after signup: personal note from the founder. */
export async function sendCreatorDay3(r: Recipient) {
  await sendOwnerEmail(r.to, CREATOR_DAY3_SUBJECT, creatorDay3Html(r.name), {
    replyTo: CREATOR_REPLY_TO,
    kind: "lifecycle_creator_day3",
  });
}
