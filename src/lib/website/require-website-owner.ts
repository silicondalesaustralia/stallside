import { redirect } from "next/navigation";
import { requireOwnerWrite } from "@/lib/session";
import { websiteSectionEnabledFor } from "@/lib/website/access";

/** Owner gate for Website section server actions; enforces the beta allowlist. */
export async function requireWebsiteOwner() {
  const session = await requireOwnerWrite();
  if (!websiteSectionEnabledFor(session.owner.id)) redirect("/dashboard");
  return session;
}
