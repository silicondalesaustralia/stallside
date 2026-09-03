import DashboardTopBar from "@/components/DashboardTopBar";
import DashHubSubnav from "@/components/DashHubSubnav";

/** Coherent content frame for the owner dashboard. */
export default function AppShell({
  children,
  businessName,
  liveHref,
  notificationCount = 0,
  showTopBar = true,
}: {
  children: React.ReactNode;
  businessName: string;
  liveHref: string | null;
  notificationCount?: number;
  showTopBar?: boolean;
}) {
  return (
    <div className="w-full min-w-0 flex-1 px-4 py-5 print:px-0 print:py-0 md:px-7 md:py-7">
      {showTopBar ? (
        <DashboardTopBar
          businessName={businessName}
          liveHref={liveHref}
          notificationCount={notificationCount}
        />
      ) : null}
      <DashHubSubnav />
      {children}
    </div>
  );
}
