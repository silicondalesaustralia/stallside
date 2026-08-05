import { APP_NAME } from "@/lib/constants";
import { cleanEnvSecret } from "@/lib/env";
import { filterEmailsForActiveOwners } from "@/lib/owner-deleted";
import { prisma } from "@/lib/prisma";

/** Real inbox for contact/waitlist owner mail until hello@ has a mailbox. */
const OWNER_INBOX = "jono@silicondales.com";

export function contactInbox(): string {
  const configured = cleanEnvSecret(process.env.CONTACT_EMAIL)?.toLowerCase();
  // Public brand address (hello@) has no mailbox yet - Resend accepts it then it vanishes.
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

async function logEmailSend(input: {
  toEmails: string[];
  subject: string;
  kind?: string;
  status: "sent" | "failed" | "console";
  resendId?: string | null;
  error?: string | null;
}) {
  const subject =
    input.kind === "otp"
      ? input.subject.replace(/^\d{6}/, "******")
      : input.subject;
  try {
    await prisma.emailSendLog.create({
      data: {
        toEmails: input.toEmails.map((e) => e.toLowerCase()),
        subject,
        kind: input.kind ?? null,
        status: input.status,
        resendId: input.resendId ?? null,
        error: input.error ?? null,
      },
    });
  } catch (error) {
    console.error(`[${APP_NAME}] email send log failed`, error);
  }
}

export async function sendOwnerEmail(
  to: string | string[],
  subject: string,
  html: string,
  options?: {
    replyTo?: string;
    headers?: Record<string, string>;
    kind?: string;
  },
) {
  const requested = (Array.isArray(to) ? to : [to])
    .map((email) => email.trim())
    .filter(Boolean);
  // OTP must still reach soft-closed owners so they can sign in.
  const recipients =
    options?.kind === "otp"
      ? requested
      : await filterEmailsForActiveOwners(requested);
  if (!recipients.length) return;

  const apiKey = cleanEnvSecret(process.env.RESEND_API_KEY);
  if (!apiKey) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("RESEND_API_KEY is not set");
    }
    console.log(
      `\n[${APP_NAME} notify email] ${recipients.join(", ")}\n${subject}\n${html}\n`,
    );
    await logEmailSend({
      toEmails: recipients,
      subject,
      kind: options?.kind,
      status: "console",
    });
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
    headers?: Record<string, string>;
  } = {
    from,
    to: recipients,
    subject,
    html,
  };
  if (options?.replyTo) {
    body.reply_to = options.replyTo;
  }
  if (options?.headers && Object.keys(options.headers).length > 0) {
    body.headers = options.headers;
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
    await logEmailSend({
      toEmails: recipients,
      subject,
      kind: options?.kind,
      status: "failed",
      error: detail.slice(0, 2000),
    });
    throw new Error(`Email failed: ${detail}`);
  }

  let resendId: string | null = null;
  try {
    const payload = (await res.json()) as { id?: string };
    resendId = payload.id ?? null;
  } catch {
    /* ignore parse errors */
  }

  console.info(`[${APP_NAME}] email sent`, { to: recipients, subject, resendId });
  await logEmailSend({
    toEmails: recipients,
    subject,
    kind: options?.kind,
    status: "sent",
    resendId,
  });
}
