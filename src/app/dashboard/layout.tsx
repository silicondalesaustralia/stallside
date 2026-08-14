import type { Metadata } from "next";
import DashboardMobileNav from "@/components/DashboardMobileNav";
import DashboardNav from "@/components/DashboardNav";
import ImpersonationBanner from "@/components/ImpersonationBanner";
import OwnerPushRegister from "@/components/OwnerPushRegisterLazy";
import TrialDaysBadge from "@/components/TrialDaysBadge";
import { requireOwner } from "@/lib/session";
import { paidAccessDaysRemaining } from "@/lib/owner-trial";
import { resolveSelectedBusiness } from "@/lib/selected-business";
import { prisma } from "@/lib/prisma";

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

  const unreadNotifications = await prisma.notification.count({
    where: { ownerId: owner.id, status: "OPEN" },
  });

  return (
    <div className="flex min-h-full flex-1 bg-[var(--wash)] print:bg-white">
      <DashboardNav
        businesses={businesses}
        selectedBusinessId={selected?.id ?? null}
        unreadNotifications={unreadNotifications}
      />
      <div className="flex min-w-0 flex-1 flex-col pb-28 print:pb-0 md:pb-0">
        <OwnerPushRegister
          pushAlertsEnabled={owner.pushAlertsEnabled && !impersonator}
        />
        <DashboardMobileNav
          businesses={businesses}
          selectedBusinessId={selected?.id ?? null}
          unreadNotifications={unreadNotifications}
        />
        {impersonator ? (
          <ImpersonationBanner
            targetEmail={user.email ?? owner.contactEmail}
            adminEmail={impersonator.email}
          />
        ) : null}
        <div className="mx-auto w-full max-w-[86rem] flex-1 px-4 py-6 print:max-w-none print:px-0 print:py-0 md:px-6 md:py-8">
          {paidDays != null ? (
            <TrialDaysBadge daysLeft={paidDays} mode="paid" />
          ) : null}
          {children}
        </div>
      </div>
    </div>
  );
}
