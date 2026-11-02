import { redirect } from "next/navigation";
import { ownerIdHasProAccess } from "@/lib/owner-pro-access";
import { requireOwnerWrite } from "@/lib/session";
import { websiteSectionEnabledFor } from "@/lib/website/access";

/** Owner gate for Website section server actions; enforces the beta allowlist. */
export async function requireWebsiteOwner() {
  const session = await requireOwnerWrite();
  if (!websiteSectionEnabledFor(session.owner.id)) redirect("/dashboard");
  return session;
}

/** Website builder actions (Web Studio, pages, blog, domains, redirects, tags): Pro only. */
export async function requireWebsiteProOwner() {
  const session = await requireWebsiteOwner();
  if (!(await ownerIdHasProAccess(session.owner.id))) redirect("/dashboard/why-pro");
  return session;
}
