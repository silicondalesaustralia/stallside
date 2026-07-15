import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import DashboardNav from "@/components/DashboardNav";
import OwnerPushRegister from "@/components/OwnerPushRegister";
import TrialDaysBadge from "@/components/TrialDaysBadge";
import { requireOwner } from "@/lib/session";
import { ownerNeedsPayment, trialDaysRemaining } from "@/lib/owner-trial";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { owner } = await requireOwner();
  const pathname = (await headers()).get("x-pathname") ?? "";
  const onBilling = pathname.startsWith("/dashboard/settings/billing");

  if (ownerNeedsPayment(owner) && !onBilling) {
    redirect("/dashboard/settings/billing?trial=ended");
  }

  const daysLeft = trialDaysRemaining(owner);

  return (
    <div className="flex min-h-full flex-1 flex-col bg-[var(--wash)] pb-20 print:bg-white print:pb-0 md:pb-0">
      <OwnerPushRegister />
      <DashboardNav />
      <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 print:max-w-none print:px-0 print:py-0">
        {daysLeft != null ? <TrialDaysBadge daysLeft={daysLeft} /> : null}
        {children}
      </div>
    </div>
  );
}
