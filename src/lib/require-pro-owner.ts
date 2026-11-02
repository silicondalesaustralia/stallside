import { redirect } from "next/navigation";
import { WHY_PRO_PATH } from "@/components/dash-nav-links";
import { ownerIdHasProAccess } from "@/lib/owner-pro-access";
import { requireOwnerWrite } from "@/lib/session";

/** Owner gate for server actions behind Vendl Pro; Free owners land on the Why Pro page. */
export async function requireProOwnerWrite() {
  const session = await requireOwnerWrite();
  if (!(await ownerIdHasProAccess(session.owner.id))) redirect(WHY_PRO_PATH);
  return session;
}
