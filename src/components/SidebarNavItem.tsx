import Link from "next/link";
import DashNavIcon from "@/components/DashNavIcon";

/** One clickable sidebar link with its icon and optional alert badge. */
export default function SidebarNavItem({
  href,
  label,
  collapsed,
  active,
  badge,
}: {
  href: string;
  label: string;
  collapsed: boolean;
  active: boolean;
  badge?: number;
}) {
  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      className={`flex items-center rounded-lg transition-colors duration-200 ${
        collapsed ? "justify-center px-2 py-2" : "gap-3 px-3 py-2"
      } ${
        active
          ? "bg-white/12 text-[var(--ink-on-dark)]"
          : "text-[var(--ink-on-dark)]/70 hover:bg-white/10 hover:text-[var(--ink-on-dark)]"
      }`}
    >
      <span className={`relative ${active ? "text-[var(--marigold)]" : undefined}`}>
        <DashNavIcon href={href} />
        {badge && badge > 0 ? (
          <span className="absolute -right-1 -top-1 size-2 rounded-full bg-[var(--gone)]" />
        ) : null}
      </span>
      {collapsed ? null : (
        <span className="flex flex-1 items-center justify-between gap-2">
          <span className="truncate text-sm">{label}</span>
          {badge && badge > 0 ? (
            <span className="flex size-5 items-center justify-center rounded-full bg-[var(--gone)] text-[10px] font-bold text-white">
              {badge > 9 ? "9+" : badge}
            </span>
          ) : null}
        </span>
      )}
    </Link>
  );
}
