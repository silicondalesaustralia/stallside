import BrandLockup from "@/components/BrandLockup";
import DashNavIcon from "@/components/DashNavIcon";
import {
  primaryLinks,
  secondaryLinks,
} from "@/components/dash-nav-links";

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
      <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-3">
        {primaryLinks.map((link) => {
          const active = link.href === "/dashboard";
          return (
            <div
              key={link.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 ${
                active
                  ? "bg-white/12 text-[var(--ink-on-dark)]"
                  : "text-[var(--ink-on-dark)]/70"
              }`}
            >
              <span className={active ? "text-[var(--marigold)]" : undefined}>
                <DashNavIcon href={link.href} />
              </span>
              <span className="truncate text-sm">{link.label}</span>
            </div>
          );
        })}
        <div className="my-2 border-t border-white/10" />
        {secondaryLinks.map((link) => {
          const badge =
            link.href === "/dashboard/notifications"
              ? unreadNotifications
              : 0;
          return (
            <div
              key={link.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-[var(--ink-on-dark)]/70"
            >
              <span className="relative">
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
      </nav>
      <div className="border-t border-white/10 px-2 py-3">
        <div className="rounded-lg bg-white/10 px-3 py-2 text-sm font-medium text-[var(--ink-on-dark)]">
          {standName}
        </div>
        <div className="mt-2 flex items-center gap-3 rounded-lg px-3 py-2.5">
          <span className="flex size-8 items-center justify-center rounded-full bg-[var(--ink-on-dark)]/15 text-xs font-medium text-[var(--ink-on-dark)]">
            Me
          </span>
          <span className="truncate text-sm font-medium text-[var(--ink-on-dark)]">
            Account
          </span>
        </div>
      </div>
    </aside>
  );
}
