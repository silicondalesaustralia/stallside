import crypto from "node:crypto";
import { appBaseUrl } from "@/lib/app-url";
import { prisma } from "@/lib/prisma";

/** Swapped for each recipient's signed link at send time (see sendOwnerEmail). */
export const LIFECYCLE_UNSUB_PLACEHOLDER = "{{LIFECYCLE_UNSUB_URL}}";

function sign(email: string): string {
  const secret = process.env.AUTH_SECRET ?? "dev";
  return crypto
    .createHmac("sha256", secret)
    .update(`lifecycle-unsub:${email}`)
    .digest("hex")
    .slice(0, 32);
}

/** No expiry: Spam Act unsubscribe links must keep working. */
export function signLifecycleUnsub(emailRaw: string): string {
  const email = emailRaw.trim().toLowerCase();
  return `${Buffer.from(email).toString("base64url")}.${sign(email)}`;
}

export function verifyLifecycleUnsub(token: string): string | null {
  const dot = token.lastIndexOf(".");
  if (dot <= 0 || token.length > 512) return null;
  try {
    const email = Buffer.from(token.slice(0, dot), "base64url").toString("utf8");
    const given = Buffer.from(token.slice(dot + 1));
    const expected = Buffer.from(sign(email));
    if (given.length !== expected.length) return null;
    if (!crypto.timingSafeEqual(given, expected)) return null;
    return email.includes("@") ? email : null;
  } catch {
    return null;
  }
}

export function lifecycleUnsubLinks(email: string) {
  const t = encodeURIComponent(signLifecycleUnsub(email));
  const base = appBaseUrl();
  return {
    page: `${base}/unsubscribe/emails?t=${t}`,
    oneClick: `${base}/api/lifecycle/unsubscribe?t=${t}`,
  };
}

function ownerEmailWhere(emails: string[]) {
  return [
    { contactEmail: { in: emails, mode: "insensitive" as const } },
    { user: { email: { in: emails } } },
  ];
}

export async function optOutLifecycleEmails(email: string): Promise<void> {
  await prisma.owner.updateMany({
    where: { lifecycleEmailsOptOutAt: null, OR: ownerEmailWhere([email]) },
    data: { lifecycleEmailsOptOutAt: new Date() },
  });
}

export async function filterLifecycleOptOuts(emails: string[]): Promise<string[]> {
  const lower = emails.map((e) => e.trim().toLowerCase());
  const optedOut = await prisma.owner.findMany({
    where: { lifecycleEmailsOptOutAt: { not: null }, OR: ownerEmailWhere(lower) },
    select: { contactEmail: true, user: { select: { email: true } } },
  });
  const blocked = new Set<string>();
  for (const owner of optedOut) {
    blocked.add(owner.contactEmail.trim().toLowerCase());
    if (owner.user?.email) blocked.add(owner.user.email.trim().toLowerCase());
  }
  return lower.filter((email) => !blocked.has(email));
}

type SendOne = (
  to: string,
  html: string,
  headers: Record<string, string>,
) => Promise<void>;

/** Drop opted-out recipients, then send each one their own unsubscribe link. */
export async function sendWithLifecycleUnsub(
  recipients: string[],
  html: string,
  sendOne: SendOne,
): Promise<void> {
  for (const to of await filterLifecycleOptOuts(recipients)) {
    const links = lifecycleUnsubLinks(to);
    await sendOne(to, html.replaceAll(LIFECYCLE_UNSUB_PLACEHOLDER, links.page), {
      "List-Unsubscribe": `<${links.oneClick}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    });
  }
}
