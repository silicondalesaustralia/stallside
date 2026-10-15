/** Waiting state for a domain bought through Vendl — DNS is already set, nothing to add. */
export default function ManagedDnsNote({ lastCheckedAt }: { lastCheckedAt: Date | null }) {
  return (
    <div className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-4 text-sm">
      <p className="font-semibold text-[var(--field)]">We&apos;ve set up the DNS for you</p>
      <p className="mt-2 text-[var(--muted)]">
        Nothing to add at a registrar. The security certificate usually takes 5 to 30 minutes, sometimes up
        to an hour. Tap Check again to refresh.
        {lastCheckedAt ? ` Last checked: ${lastCheckedAt.toLocaleString()}.` : null}
      </p>
    </div>
  );
}
