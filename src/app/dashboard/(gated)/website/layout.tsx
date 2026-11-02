import { redirect } from "next/navigation";
import ProFeatureGate from "@/components/dashboard/ProFeatureGate";
import WebsiteMobileSubnav from "@/components/website/WebsiteMobileSubnav";
import { requireOwner } from "@/lib/session";
import { websiteSectionEnabledFor } from "@/lib/website/access";

export default async function WebsiteLayout({ children }: { children: React.ReactNode }) {
  const { owner } = await requireOwner();
  if (!websiteSectionEnabledFor(owner.id)) redirect("/dashboard");

  return (
    <ProFeatureGate feature="website">
      <WebsiteMobileSubnav />
      {children}
    </ProFeatureGate>
  );
}
