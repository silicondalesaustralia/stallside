import Link from "next/link";
import { redirect } from "next/navigation";
import PageHeader from "@/components/dashboard/ui/PageHeader";
import ProUpgradeCard from "@/components/dashboard/ProUpgradeCard";
import WebsiteMobileSubnav from "@/components/website/WebsiteMobileSubnav";
import { ownerIdHasProAccess } from "@/lib/owner-pro-access";
import { requireOwner } from "@/lib/session";
import { websiteSectionEnabledFor } from "@/lib/website/access";

export default async function WebsiteLayout({ children }: { children: React.ReactNode }) {
  const { owner } = await requireOwner();
  if (!websiteSectionEnabledFor(owner.id)) redirect("/dashboard");

  if (!(await ownerIdHasProAccess(owner.id))) {
    return (
      <main className="flex max-w-3xl flex-col gap-5">
        <PageHeader title="Your website" />
        <ProUpgradeCard eyebrow="Website builder">
          Build your own website with Web Studio, add pages and a blog, claim your vendl.app subdomain or connect your
          own domain, set up redirects, and add Google, Meta and TikTok tags. Included with Vendl Pro.
        </ProUpgradeCard>
        <Link href="/dashboard/why-pro" className="text-sm font-semibold text-[var(--field)] underline">
          See everything in Pro
        </Link>
      </main>
    );
  }

  return (
    <>
      <WebsiteMobileSubnav />
      {children}
    </>
  );
}
