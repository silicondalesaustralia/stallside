export default function DashListCard({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dash-card relative overflow-hidden pl-5">
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 w-1.5 bg-[var(--field)]"
      />
      {children}
    </div>
  );
}
