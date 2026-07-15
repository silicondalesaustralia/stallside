import type { Metadata } from "next";
import DashboardNav from "@/components/DashboardNav";
import OwnerPushRegister from "@/components/OwnerPushRegister";
import TrialDaysBadge from "@/components/TrialDaysBadge";
import { requireOwner } from "@/lib/session";
import {
  paidAccessDaysRemaining,
  trialDaysRemaining,
} from "@/lib/owner-trial";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { owner } = await requireOwner();
  const trialDays = trialDaysRemaining(owner);
  const paidDays = paidAccessDaysRemaining(owner);

  return (
    <div className="flex min-h-full flex-1 flex-col bg-[var(--wash)] pb-20 print:bg-white print:pb-0 md:pb-0">
      <OwnerPushRegister />
      <DashboardNav />
      <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 print:max-w-none print:px-0 print:py-0">
        {trialDays != null ? (
          <TrialDaysBadge daysLeft={trialDays} mode="trial" />
        ) : paidDays != null ? (
          <TrialDaysBadge daysLeft={paidDays} mode="paid" />
        ) : null}
        {children}
      </div>
    </div>
  );
}
