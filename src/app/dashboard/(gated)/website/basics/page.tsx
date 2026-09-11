import { redirect } from "next/navigation";
import { webStudioPath } from "@/lib/website/web-studio-nav";

/** Legacy basics route → Web Studio business details tab. */
export default function WebsiteBasicsRedirect() {
  redirect(webStudioPath("details"));
}
