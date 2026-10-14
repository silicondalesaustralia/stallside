/** Top-right "View on site" button for dashboard edit screens whose item has a public page. */
export default function ViewOnSiteLink({ href, label = "View on site" }: { href: string; label?: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[var(--line)] bg-white px-4 py-2 text-sm font-semibold text-[var(--field)] hover:border-[var(--leaf)]"
    >
      {label}
      <svg viewBox="0 0 24 24" aria-hidden className="size-4 fill-none stroke-current stroke-2 [stroke-linecap:round] [stroke-linejoin:round]">
        <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
      </svg>
      <span className="sr-only">(opens in a new tab)</span>
    </a>
  );
}
