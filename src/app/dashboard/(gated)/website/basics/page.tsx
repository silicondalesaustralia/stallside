import { redirect } from "next/navigation";

/** Legacy Phase 4B editor removed — shop identity lives under Details. */
export default function WebsiteBasicsRedirectPage() {
  redirect("/dashboard/website/details");
}
