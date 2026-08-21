import DashboardMobileNav from "@/components/DashboardMobileNav";
import DashboardNav from "@/components/DashboardNav";
import { prisma } from "@/lib/prisma";
import type { BusinessOption } from "@/lib/selected-business";

export default async function DashboardNavWithUnread({
  ownerId,
  businesses,
  selectedBusinessId,
  variant,
}: {
  ownerId: string;
  businesses: BusinessOption[];
  selectedBusinessId: string | null;
  variant: "sidebar" | "mobile";
}) {
  const unreadNotifications = await prisma.notification.count({
    where: { ownerId, status: "OPEN" },
  });

  if (variant === "mobile") {
    return (
      <DashboardMobileNav
        businesses={businesses}
        selectedBusinessId={selectedBusinessId}
        unreadNotifications={unreadNotifications}
      />
    );
  }

  return (
    <DashboardNav
      businesses={businesses}
      selectedBusinessId={selectedBusinessId}
      unreadNotifications={unreadNotifications}
    />
  );
}
