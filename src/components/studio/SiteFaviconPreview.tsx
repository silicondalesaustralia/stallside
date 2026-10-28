/** A browser-tab mock-up showing the favicon at its real size next to the domain. */
export default function SiteFaviconPreview({ url, domain }: { url: string | null; domain: string }) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex w-64 max-w-full items-center gap-2 rounded-t-lg border border-b-0 border-[var(--line)] bg-white px-3 py-2 shadow-sm">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element -- favicons can be .ico, which next/image doesn't optimise
          <img src={url} alt="" width={16} height={16} className="h-4 w-4 shrink-0 object-contain" />
        ) : (
          <span className="h-4 w-4 shrink-0 rounded-sm bg-[var(--line)]" aria-hidden />
        )}
        <span className="truncate text-xs text-[var(--ink)]">{domain}</span>
      </div>
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element -- see above
        <img src={url} alt="Your favicon" width={48} height={48} className="h-12 w-12 rounded-md border border-[var(--line)] object-contain" />
      ) : (
        <p className="text-xs text-[var(--muted)]">No favicon yet.</p>
      )}
    </div>
  );
}
