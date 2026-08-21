export default function DashboardGreeting({
  standName,
}: {
  standName: string;
}) {
  const now = new Date();
  const hour = now.getHours();
  const hello =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const when = now.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">
        {when}
      </p>
      <h1 className="mt-1 font-[family-name:var(--font-display)] text-[30px] font-bold leading-tight tracking-tight text-[var(--field)]">
        {hello}, {standName}
      </h1>
    </div>
  );
}
