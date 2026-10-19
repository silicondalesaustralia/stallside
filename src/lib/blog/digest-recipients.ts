import { cleanEnvSecret } from "@/lib/env";
import { contactInbox } from "@/lib/notify-email";

/** BLOG_DIGEST_EMAIL (comma separated) or the platform contact inboxes. */
export function blogDigestRecipients(): string[] {
  const configured = cleanEnvSecret(process.env.BLOG_DIGEST_EMAIL);
  if (!configured) return contactInbox();
  return configured.split(",").map((e) => e.trim()).filter(Boolean);
}
