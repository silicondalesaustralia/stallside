import { redirect } from "next/navigation";

/** Website hub root → Studio (Craft editor). */
export default function WebsitePage() {
  redirect("/dashboard/website/studio");
}
