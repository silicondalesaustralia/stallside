const LABEL = "Go To Skool";
const SKOOL_URL = "https://www.skool.com/vendl-9093";

/** Highlighted link to the Vendl Skool community; opens in a new tab. */
export default function SkoolNavLink({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <a
      href={SKOOL_URL}
      target="_blank"
      rel="noopener noreferrer"
      title={collapsed ? LABEL : undefined}
      data-testid="nav-skool"
      className={`flex items-center rounded-lg bg-violet-500 font-bold text-white shadow-sm transition-colors hover:bg-violet-400 ${
        collapsed ? "justify-center px-2 py-2" : "gap-3 px-3 py-2"
      }`}
    >
      <svg aria-hidden viewBox="0 0 20 20" fill="currentColor" className="size-5 shrink-0">
        <path d="M7 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm6.5 1a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM1 16c0-3 2.7-5 6-5s6 2 6 5v1H1v-1zm13.5 1v-1c0-1.5-.5-2.9-1.4-4 .1 0 .3-.1.4-.1 2.6 0 4.5 1.6 4.5 4v1.1h-3.5z" />
      </svg>
      {collapsed ? null : (
        <>
          <span className="flex-1 truncate text-sm">{LABEL}</span>
          <span aria-hidden className="text-sm opacity-80">↗</span>
          <span className="sr-only">(opens in a new tab)</span>
        </>
      )}
    </a>
  );
}
