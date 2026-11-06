const LABEL = "Contact Support";
const SUPPORT_HREF = "/contact?subject=support";

/** Opens the public contact form (Support subject) in a new tab. */
export default function SupportNavLink({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <a
      href={SUPPORT_HREF}
      target="_blank"
      rel="noopener noreferrer"
      title={collapsed ? LABEL : undefined}
      data-testid="nav-support"
      className={`flex items-center rounded-lg text-[var(--ink-on-dark)]/80 transition-colors hover:bg-white/10 hover:text-[var(--ink-on-dark)] ${
        collapsed ? "justify-center px-2 py-2" : "gap-3 px-3 py-2"
      }`}
    >
      <svg aria-hidden viewBox="0 0 20 20" fill="currentColor" className="size-5 shrink-0">
        <path d="M10 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16zm0 12.5a1 1 0 1 1 0 2 1 1 0 0 1 0-2zM10 5a3 3 0 0 1 1.2 5.75c-.5.22-.7.5-.7.95v.3h-1.5v-.3c0-1.1.55-1.8 1.6-2.3A1.5 1.5 0 1 0 8.5 8H7a3 3 0 0 1 3-3z" />
      </svg>
      {collapsed ? null : (
        <>
          <span className="flex-1 truncate text-sm font-semibold">{LABEL}</span>
          <span aria-hidden className="text-sm opacity-70">↗</span>
          <span className="sr-only">(opens in a new tab)</span>
        </>
      )}
    </a>
  );
}
