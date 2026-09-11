import { redirect } from "next/navigation";

/** Website hub root → Web Studio create flow (business details). */
export default function WebsitePage() {
  redirect("/dashboard/website/details");
}
