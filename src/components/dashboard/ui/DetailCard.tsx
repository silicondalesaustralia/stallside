/** Section card on dashboard detail pages (order, customer, …). */
export default function DetailCard({
  title,
  badge,
  action,
  children,
}: {
  title?: string;
  badge?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="dash-card p-4">
      {title || badge || action ? (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            {badge}
            {title ? <h2 className="text-sm font-bold">{title}</h2> : null}
          </div>
          {action}
        </div>
      ) : null}
      {children}
    </section>
  );
}
