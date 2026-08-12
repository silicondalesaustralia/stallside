export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-8 animate-pulse" aria-busy="true">
      <div className="h-9 w-48 rounded bg-[var(--line)]" />
      <div className="h-4 w-64 rounded bg-[var(--line)]" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="h-24 rounded-[var(--radius)] bg-[var(--line)]" />
        ))}
      </div>
      <div className="h-48 rounded-[var(--radius)] bg-[var(--line)]" />
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="h-40 rounded-[var(--radius)] bg-[var(--line)]" />
        <div className="h-40 rounded-[var(--radius)] bg-[var(--line)]" />
      </div>
    </div>
  );
}
