import DashboardMobileNav from "@/components/DashboardMobileNav";
import DashboardNav from "@/components/DashboardNav";
import { loadDashboardSetupAlerts } from "@/lib/load-dashboard-setup-alerts";
import { prisma } from "@/lib/prisma";
import type { BusinessOption } from "@/lib/selected-business";

export default async function DashboardNavWithUnread({
  ownerId,
  businesses,
  selectedBusinessId,
  stripeAccountId,
  stripeChargesEnabled,
  variant,
}: {
  ownerId: string;
  businesses: BusinessOption[];
  selectedBusinessId: string | null;
  stripeAccountId: string | null;
  stripeChargesEnabled: boolean;
  variant: "sidebar" | "mobile";
}) {
  const [unreadNotifications, setupAlerts] = await Promise.all([
    prisma.notification.count({
      where: { ownerId, status: "OPEN" },
    }),
    loadDashboardSetupAlerts({
      ownerId,
      businessCount: businesses.length,
      selectedStandId: selectedBusinessId,
      stripeAccountId,
      stripeChargesEnabled,
    }),
  ]);

  if (variant === "mobile") {
    return (
      <DashboardMobileNav
        businesses={businesses}
        selectedBusinessId={selectedBusinessId}
        unreadNotifications={unreadNotifications}
        setupAlerts={setupAlerts}
      />
    );
  }

  return (
    <DashboardNav
      businesses={businesses}
      selectedBusinessId={selectedBusinessId}
      unreadNotifications={unreadNotifications}
      setupAlerts={setupAlerts}
    />
  );
}
