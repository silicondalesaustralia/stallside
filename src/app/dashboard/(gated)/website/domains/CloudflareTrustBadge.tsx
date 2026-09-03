/** Compact Cloudflare trust mark for Domains DNS setup. */
export default function CloudflareTrustBadge() {
  return (
    <div className="flex gap-3 rounded-lg border border-[var(--line)] bg-white px-3 py-2.5">
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md"
        style={{ background: "#F6821F" }}
        aria-hidden
      >
        <svg viewBox="0 0 32 20" className="h-4 w-6" xmlns="http://www.w3.org/2000/svg">
          <path
            fill="#fff"
            d="M7.4 14.8c.2-.7 1-1.8 2.5-1.8.3 0 .6 0 .8.1C9.6 11.8 8 11 6.1 11c-2.8 0-5 1.9-5.5 4.4 0 .3-.1.5-.1.8 0 .1 0 .3 0 .4h5.8c.1 0 .3-.1.4-.2.1-.1.1-.3.1-.4 0-.4-.1-.8-.4-1.2zm7.1-3.2c-.2 0-.4 0-.7.1-.1-1.9-1.7-3.4-3.6-3.4-1 0-2 .5-2.7 1.1-.5-.2-1.1-.4-1.8-.4-1.9 0-3.4 1.3-3.9 2.9h12.3c.2 0 .4.2.4.4 0 .1 0 .1 0 .2-.3 1-1.2 1.7-2.2 1.7H3.2c.4 1.9 2.2 3.4 4.3 3.4 1.2 0 2.2-.5 3-1.3.6.4 1.3.6 2.1.6 2.1 0 3.9-1.6 4.1-3.7 0-.1 0-.1 0-.2.1-1-.7-1.7-2-1.7z"
          />
        </svg>
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-[var(--field)]">
          Powered by Cloudflare security
        </p>
        <p className="mt-0.5 text-xs leading-snug text-[var(--muted)]">
          Free SSL and DDoS protection run on Cloudflare&apos;s network. You only
          add DNS records at your domain host — never share registrar passwords or
          API keys with Vendl.
        </p>
      </div>
    </div>
  );
}
