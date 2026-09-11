import { redirect } from "next/navigation";
import { webStudioPath } from "@/lib/website/web-studio-nav";

/** Legacy route → unified Web Studio tabs. */
export default async function WebsiteBrandingRedirect({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  redirect(webStudioPath("branding", sp));
}
