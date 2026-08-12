import type { Metadata } from "next";
import DashboardNav from "@/components/DashboardNav";
import ImpersonationBanner from "@/components/ImpersonationBanner";
import OwnerPushRegister from "@/components/OwnerPushRegisterLazy";
import TrialDaysBadge from "@/components/TrialDaysBadge";
import { requireOwner } from "@/lib/session";
import { paidAccessDaysRemaining } from "@/lib/owner-trial";
import { resolveSelectedBusiness } from "@/lib/selected-business";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { owner, user, impersonator } = await requireOwner();
  const access = { email: user.email, role: user.role };
  const paidDays = paidAccessDaysRemaining(owner, access);
  const { businesses, selected } = await resolveSelectedBusiness(owner.id);

  return (
    <div className="flex min-h-full flex-1 flex-col bg-[var(--wash)] pb-20 print:bg-white print:pb-0 md:pb-0">
      {impersonator ? (
        <ImpersonationBanner
          targetEmail={user.email ?? owner.contactEmail}
          adminEmail={impersonator.email}
        />
      ) : null}
      <OwnerPushRegister
        pushAlertsEnabled={owner.pushAlertsEnabled && !impersonator}
      />
      <DashboardNav
        businesses={businesses}
        selectedBusinessId={selected?.id ?? null}
      />
      <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 print:max-w-none print:px-0 print:py-0">
        {paidDays != null ? (
          <TrialDaysBadge daysLeft={paidDays} mode="paid" />
        ) : null}
        {children}
      </div>
    </div>
  );
}
