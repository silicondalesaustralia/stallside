import { APP_NAME } from "@/lib/constants";
import { cleanEnvSecret } from "@/lib/env";

/** Real inbox for contact/waitlist owner mail until hello@ has a mailbox. */
const OWNER_INBOX = "jono@silicondales.com";

export function contactInbox(): string {
  const configured = cleanEnvSecret(process.env.CONTACT_EMAIL)?.toLowerCase();
  // Public brand address (hello@) has no mailbox yet — Resend accepts it then it vanishes.
  if (!configured || configured.endsWith("@stallside.app")) {
    if (configured) {
      console.warn(
        `[${APP_NAME}] Ignoring CONTACT_EMAIL=${configured}; using ${OWNER_INBOX}`,
      );
    }
    return OWNER_INBOX;
  }
  return configured;
}

export async function sendOwnerEmail(
  to: string | string[],
  subject: string,
  html: string,
  options?: { replyTo?: string },
) {
  const recipients = (Array.isArray(to) ? to : [to])
    .map((email) => email.trim())
    .filter(Boolean);
  if (!recipients.length) return;

  const apiKey = cleanEnvSecret(process.env.RESEND_API_KEY);
  if (!apiKey) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("RESEND_API_KEY is not set");
    }
    console.log(
      `\n[${APP_NAME} notify email] ${recipients.join(", ")}\n${subject}\n${html}\n`,
    );
    return;
  }

  const from =
    cleanEnvSecret(process.env.EMAIL_FROM) ||
    `${APP_NAME} <hello@stallside.app>`;
  const body: {
    from: string;
    to: string[];
    subject: string;
    html: string;
    reply_to?: string;
  } = {
    from,
    to: recipients,
    subject,
    html,
  };
  if (options?.replyTo) {
    body.reply_to = options.replyTo;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const detail = await res.text();
    console.error(`[${APP_NAME}] notify email failed`, {
      to: recipients,
      subject,
      detail,
    });
    throw new Error(`Email failed: ${detail}`);
  }

  console.info(`[${APP_NAME}] email sent`, { to: recipients, subject });
}
