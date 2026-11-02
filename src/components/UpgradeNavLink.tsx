import Link from "next/link";
import { WHY_PRO_PATH } from "@/components/dash-nav-links";

const LABEL = "Why Upgrade To PRO";

/** Highlighted top-of-menu link to the Pro benefits page, shown to non-Pro owners only. */
export default function UpgradeNavLink({
  collapsed = false,
  active,
  onNavigate,
}: {
  collapsed?: boolean;
  active: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={WHY_PRO_PATH}
      title={collapsed ? LABEL : undefined}
      onClick={onNavigate}
      className={`mb-3 flex items-center rounded-lg bg-[var(--marigold)] font-bold text-[var(--field)] shadow-sm transition-colors hover:brightness-105 ${
        collapsed ? "justify-center px-2 py-2" : "gap-3 px-3 py-2"
      } ${active ? "ring-2 ring-white/70" : ""}`}
    >
      <svg aria-hidden viewBox="0 0 20 20" fill="currentColor" className="size-5 shrink-0">
        <path d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.5 7.7l5.9-.9L10 1.5z" />
      </svg>
      {collapsed ? null : <span className="truncate text-sm">{LABEL}</span>}
    </Link>
  );
}
