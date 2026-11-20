const LABEL = "Stitchstack Analytics";
/** Until partner SSO ships, open Stitchstack directly (same external-tab pattern as Skool). */
const STITCHSTACK_URL = "https://stitchstack.app";

/** Highlighted link to Stitchstack Analytics; opens in a new tab. Teal to contrast Skool violet. */
export default function StitchstackAnalyticsNavLink({
  collapsed = false,
}: {
  collapsed?: boolean;
}) {
  return (
    <a
      href={STITCHSTACK_URL}
      target="_blank"
      rel="noopener noreferrer"
      title={collapsed ? LABEL : undefined}
      data-testid="nav-stitchstack-analytics"
      className={`flex items-center rounded-lg bg-teal-600 font-bold text-white shadow-sm transition-colors hover:bg-teal-500 ${
        collapsed ? "justify-center px-2 py-2" : "gap-3 px-3 py-2"
      }`}
    >
      <svg aria-hidden viewBox="0 0 20 20" fill="currentColor" className="size-5 shrink-0">
        <path d="M2 11a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-6zm6-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V7zm6-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v15a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1V2z" />
      </svg>
      {collapsed ? null : (
        <>
          <span className="flex-1 truncate text-sm">{LABEL}</span>
          <span aria-hidden className="text-sm opacity-80">
            ↗
          </span>
          <span className="sr-only">(opens in a new tab)</span>
        </>
      )}
    </a>
  );
}
