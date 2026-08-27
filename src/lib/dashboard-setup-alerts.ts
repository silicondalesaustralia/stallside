export type DashboardSetupAlerts = {
  needsBusiness: boolean;
  needsProducts: boolean;
  needsStripe: boolean;
};

export function setupNavBadge(
  href: string,
  alerts: DashboardSetupAlerts,
  unreadNotifications = 0,
): number | undefined {
  if (href === "/dashboard/notifications") {
    return unreadNotifications > 0 ? unreadNotifications : undefined;
  }
  if (href === "/dashboard" && alerts.needsBusiness) return 1;
  if (href === "/dashboard/products" && alerts.needsProducts) return 1;
  if (href === "/dashboard/settings" && alerts.needsStripe) return 1;
  return undefined;
}

export function setupAlertsPending(alerts: DashboardSetupAlerts): boolean {
  return alerts.needsBusiness || alerts.needsProducts || alerts.needsStripe;
}
