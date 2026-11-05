import { redirect } from "next/navigation";
import ProFeatureGate from "@/components/dashboard/ProFeatureGate";
import DfyBuildCard from "@/components/website/DfyBuildCard";
import WebsiteMobileSubnav from "@/components/website/WebsiteMobileSubnav";
import { requireOwner } from "@/lib/session";
import { websiteSectionEnabledFor } from "@/lib/website/access";

export default async function WebsiteLayout({ children }: { children: React.ReactNode }) {
  const { owner } = await requireOwner();
  if (!websiteSectionEnabledFor(owner.id)) redirect("/dashboard");

  return (
    <ProFeatureGate feature="website" freeExtra={<DfyBuildCard currency={owner.billingCurrency} />}>
      <WebsiteMobileSubnav />
      {children}
    </ProFeatureGate>
  );
}
