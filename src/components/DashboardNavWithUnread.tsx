import DashboardMobileNav from "@/components/DashboardMobileNav";
import DashboardNav from "@/components/DashboardNav";
import { loadDashboardSetupAlerts } from "@/lib/load-dashboard-setup-alerts";
import { loadSetupProgress } from "@/lib/load-setup-progress";
import { prisma } from "@/lib/prisma";
import type { BusinessOption } from "@/lib/selected-business";

export default async function DashboardNavWithUnread({
  ownerId,
  businesses,
  selectedBusinessId,
  selectedStandSlug,
  stripeAccountId,
  stripeChargesEnabled,
  emailAlertsEnabled,
  pushAlertsEnabled,
  businessMode,
  variant,
}: {
  ownerId: string;
  businesses: BusinessOption[];
  selectedBusinessId: string | null;
  selectedStandSlug: string | null;
  stripeAccountId: string | null;
  stripeChargesEnabled: boolean;
  emailAlertsEnabled: boolean;
  pushAlertsEnabled: boolean;
  businessMode?: string | null;
  variant: "sidebar" | "mobile";
}) {
  const [unreadNotifications, setupAlerts, setupProgress] = await Promise.all([
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
    loadSetupProgress({
      ownerId,
      selectedStandId: selectedBusinessId,
      standSlug: selectedStandSlug,
      standCount: businesses.length,
      stripeChargesEnabled,
      emailAlertsEnabled,
      pushAlertsEnabled,
      businessMode,
    }),
  ]);

  const setupIncomplete = setupProgress.summary.launched
    ? 0
    : setupProgress.summary.requiredTotal - setupProgress.summary.requiredDone;

  if (variant === "mobile") {
    return (
      <DashboardMobileNav
        businesses={businesses}
        selectedBusinessId={selectedBusinessId}
        unreadNotifications={unreadNotifications}
        setupAlerts={setupAlerts}
        setupIncomplete={setupIncomplete}
      />
    );
  }

  return (
    <DashboardNav
      businesses={businesses}
      selectedBusinessId={selectedBusinessId}
      unreadNotifications={unreadNotifications}
      setupAlerts={setupAlerts}
      setupIncomplete={setupIncomplete}
    />
  );
}
