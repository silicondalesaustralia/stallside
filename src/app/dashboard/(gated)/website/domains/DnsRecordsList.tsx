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
      <dl className="mt-2 space-y-2 text-sm">
        <div className="flex items-center justify-between gap-3">
          <dt className="text-[var(--muted)]">Type</dt>
          <dd className="font-mono font-semibold text-[var(--field)]">{record.type}</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-[var(--muted)]">Name / Host</dt>
          <dd className="flex max-w-[70%] items-center gap-2 font-mono text-[var(--field)]">
            <span className="truncate">{record.name}</span>
            <DomainsCopyButton value={record.name} />
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-[var(--muted)]">Value / Target / Points to</dt>
          <dd className="flex max-w-[70%] items-center gap-2 font-mono text-[var(--field)]">
            <span className="truncate">{record.value}</span>
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
