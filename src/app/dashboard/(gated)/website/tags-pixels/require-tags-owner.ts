import { redirect } from "next/navigation";
import { ownerCanUseTagsPixels } from "@/lib/website/tracking/entitlements";
import { requireWebsiteOwner } from "@/lib/website/require-website-owner";

/** Website owner gate plus Pro; non-Pro owners land back on the page's upgrade card. */
export async function requireTagsPixelsOwner() {
  const session = await requireWebsiteOwner();
  if (!(await ownerCanUseTagsPixels(session.owner.id))) {
    redirect("/dashboard/website/tags-pixels");
  }
  return session;
}
