import type { Metadata } from "next";
import { Suspense } from "react";
import AppShell from "@/components/AppShell";
import DashboardNavWithUnread from "@/components/DashboardNavWithUnread";
import ImpersonationBanner from "@/components/ImpersonationBanner";
import OwnerPushRegister from "@/components/OwnerPushRegisterLazy";
import StripeSetupBanner from "@/components/StripeSetupBanner";
import TrialDaysBadge from "@/components/TrialDaysBadge";
import { loadStripeSetupBanner } from "@/lib/load-stripe-setup-banner";
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
  const [stripeSetupBanner, unreadNotifications] = await Promise.all([
    loadStripeSetupBanner({
      ownerId: owner.id,
      businessCount: businesses.length,
      selectedStandId: selected?.id ?? null,
      stripeAccountId: owner.stripeAccountId,
      stripeChargesEnabled: owner.stripeChargesEnabled,
    }),
    prisma.notification.count({
      where: { ownerId: owner.id, status: "OPEN" },
    }),
  ]);

  const navProps = {
    ownerId: owner.id,
    businesses,
    selectedBusinessId: selected?.id ?? null,
    selectedStandSlug: selected?.slug ?? null,
    stripeAccountId: owner.stripeAccountId,
    stripeChargesEnabled: owner.stripeChargesEnabled,
    emailAlertsEnabled: owner.emailAlertsEnabled,
    pushAlertsEnabled: owner.pushAlertsEnabled,
    businessMode: owner.businessMode,
  };

  return (
    <div className="flex min-h-full flex-1 bg-[var(--wash)] print:bg-white">
      <Suspense fallback={null}>
        <DashboardNavWithUnread {...navProps} variant="sidebar" />
      </Suspense>
      <div className="flex min-w-0 flex-1 flex-col pb-28 print:pb-0 md:pb-0">
        <OwnerPushRegister
          pushAlertsEnabled={owner.pushAlertsEnabled && !impersonator}
        />
        <Suspense fallback={null}>
          <DashboardNavWithUnread {...navProps} variant="mobile" />
        </Suspense>
        {impersonator ? (
          <ImpersonationBanner
            targetEmail={user.email ?? owner.contactEmail}
            adminEmail={impersonator.email}
          />
        ) : null}
        <AppShell
          businessName={selected?.name ?? owner.businessName}
          liveHref={selected ? `/s/${selected.slug}` : null}
          notificationCount={unreadNotifications}
        >
          {stripeSetupBanner ? (
            <StripeSetupBanner banner={stripeSetupBanner} />
          ) : null}
          {paidDays != null ? (
            <TrialDaysBadge daysLeft={paidDays} mode="paid" />
          ) : null}
          {children}
        </AppShell>
      </div>
    </div>
  );
}
