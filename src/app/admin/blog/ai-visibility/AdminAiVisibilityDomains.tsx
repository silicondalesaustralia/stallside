export default function AdminAiVisibilityDomains({ domains }: { domains: Array<{ name: string; count: number }> }) {
  if (domains.length === 0) return null;
  return (
    <section className="dash-card p-4">
      <h2 className="text-lg font-semibold">Most-cited sites (latest run)</h2>
      <p className="mb-3 text-sm text-[var(--muted)]">Number of questions where ChatGPT cited each site.</p>
      <ul className="flex flex-wrap gap-2 text-sm">
        {domains.map((domain) => (
          <li
            key={domain.name}
            className={`rounded-full px-3 py-1 ring-1 ring-[var(--line)] ${domain.name.endsWith("vendl.app") ? "bg-[var(--marigold)] text-[var(--field)]" : "bg-white"}`}
          >
            {domain.name} <span className="text-[var(--muted)]">{domain.count}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
