import DomainsCopyButton from "./DomainsCopyButton";

export type DnsRecord = {
  label: string;
  hint?: string;
  type: string;
  name: string;
  value: string;
};

function RecordRow({ record }: { record: DnsRecord }) {
  return (
    <div className="rounded-lg border border-[var(--line)] bg-white p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
        {record.label}
      </p>
      {record.hint ? (
        <p className="mt-1 text-xs text-[var(--muted)]">{record.hint}</p>
      ) : null}
      <dl className="mt-2 space-y-3 text-sm">
        <div className="grid gap-1 sm:grid-cols-[10rem_1fr] sm:items-center sm:gap-4">
          <dt className="text-[var(--muted)]">Type</dt>
          <dd className="font-mono font-semibold text-[var(--field)]">{record.type}</dd>
        </div>
        <div className="grid gap-1 sm:grid-cols-[10rem_1fr] sm:items-center sm:gap-4">
          <dt className="text-[var(--muted)]">Name / Host</dt>
          <dd className="flex min-w-0 items-center gap-2 font-mono text-[var(--field)]">
            <span className="min-w-0 break-all">{record.name}</span>
            <DomainsCopyButton value={record.name} />
          </dd>
        </div>
        <div className="grid gap-1 sm:grid-cols-[10rem_1fr] sm:items-center sm:gap-4">
          <dt className="text-[var(--muted)]">Value / Target / Points to</dt>
          <dd className="flex min-w-0 items-center gap-2 font-mono text-[var(--field)]">
            <span className="min-w-0 break-all">{record.value}</span>
            <DomainsCopyButton value={record.value} />
          </dd>
        </div>
      </dl>
    </div>
  );
}

export default function DnsRecordsList({ records }: { records: DnsRecord[] }) {
  return (
    <div className="space-y-3">
      {records.map((record) => (
        <RecordRow key={`${record.label}-${record.name}`} record={record} />
      ))}
    </div>
  );
}
