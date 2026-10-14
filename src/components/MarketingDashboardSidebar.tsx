import BrandLockup from "@/components/BrandLockup";
import DashNavIcon from "@/components/DashNavIcon";
import { visibleNavGroups } from "@/components/dash-nav-links";

/** Non-interactive clone of the real owner sidebar for marketing shots. */
export default function MarketingDashboardSidebar({
  standName,
  unreadNotifications = 3,
}: {
  standName: string;
  unreadNotifications?: number;
}) {
  return (
    <aside className="relative z-10 hidden w-52 shrink-0 flex-col self-stretch overflow-hidden rounded-2xl bg-[var(--field)] shadow-2xl [color-scheme:dark] sm:flex lg:w-60">
      <div className="flex items-center justify-between border-b border-white/10 px-3 py-3">
        <BrandLockup href="/dashboard" variant="dark" size="sm" />
        <span className="rounded-lg p-2 text-xs font-bold text-[var(--ink-on-dark)]/70">
          «
        </span>
      </div>
      <nav className="flex-1 overflow-y-auto px-2 py-3">
        {visibleNavGroups(false).map((group, index) => (
          <div key={group.heading ?? `group-${index}`} className={index > 0 ? "mt-3" : undefined}>
            {group.heading ? (
              <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wide text-[var(--ink-on-dark)]/45">
                {group.heading}
              </p>
            ) : index > 0 ? (
              <div className="mx-2 mb-2 border-t border-white/10" />
            ) : null}
            {group.links.map((link) => {
              const active = link.href === "/dashboard";
              const badge = link.href === "/dashboard/notifications" ? unreadNotifications : 0;
              return (
                <div
                  key={link.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 ${
                    active ? "bg-white/12 text-[var(--ink-on-dark)]" : "text-[var(--ink-on-dark)]/70"
                  }`}
                >
                  <span className={`relative ${active ? "text-[var(--marigold)]" : ""}`}>
                    <DashNavIcon href={link.href} />
                    {badge > 0 ? (
                      <span className="absolute -right-1 -top-1 size-2 rounded-full bg-[var(--gone)]" />
                    ) : null}
                  </span>
                  <span className="flex flex-1 items-center justify-between gap-2">
                    <span className="truncate text-sm">{link.label}</span>
                    {badge > 0 ? (
                      <span className="flex size-5 items-center justify-center rounded-full bg-[var(--gone)] text-[10px] font-bold text-white">
                        {badge > 9 ? "9+" : badge}
                      </span>
                    ) : null}
                  </span>
                </div>
              );
            })}
          </div>
        ))}
      </nav>
      <div className="border-t border-white/10 px-2 py-3">
        <div className="rounded-lg bg-white/10 px-3 py-2 text-sm font-medium text-[var(--ink-on-dark)]">
          {standName}
        </div>
      </div>
    </aside>
  );
}
