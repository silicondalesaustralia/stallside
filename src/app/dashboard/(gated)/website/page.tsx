import { redirect } from "next/navigation";
import { webStudioPath } from "@/lib/website/web-studio-nav";

/** Website hub root → Web Studio create flow. */
export default function WebsitePage() {
  redirect(webStudioPath("details"));
}
