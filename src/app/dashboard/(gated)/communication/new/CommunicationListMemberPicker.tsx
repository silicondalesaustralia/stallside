"use client";

type Member = { email: string };

export default function CommunicationListMemberPicker({
  members,
  selected,
  onChange,
  loading,
}: {
  members: Member[];
  selected: string[];
  onChange: (emails: string[]) => void;
  loading?: boolean;
}) {
  const selectedSet = new Set(selected);
  const allSelected =
    members.length > 0 && members.every((m) => selectedSet.has(m.email));

  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="text-sm font-medium">Recipients</legend>
      <div className="flex flex-wrap items-center gap-3 text-xs">
        <button
          type="button"
          className="underline text-[var(--leaf-dark)]"
          onClick={() => onChange(members.map((m) => m.email))}
          disabled={loading || members.length === 0}
        >
          Select all
        </button>
        <button
          type="button"
          className="underline text-[var(--muted)]"
          onClick={() => onChange([])}
          disabled={loading || selected.length === 0}
        >
          Clear
        </button>
        <span className="text-[var(--muted)]">
          {selected.length}/{members.length} selected
        </span>
      </div>
      <div className="max-h-56 space-y-1.5 overflow-y-auto rounded-lg border border-[var(--line)] bg-white p-3">
        {loading ? (
          <p className="text-sm text-[var(--muted)]">Loading emails…</p>
        ) : members.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">No emails on this list yet.</p>
        ) : (
          members.map((m) => (
            <label
              key={m.email}
              className="flex cursor-pointer items-center gap-2 text-sm"
            >
              <input
                type="checkbox"
                name="recipientEmail"
                value={m.email}
                checked={selectedSet.has(m.email)}
                onChange={() => {
                  if (selectedSet.has(m.email)) {
                    onChange(selected.filter((e) => e !== m.email));
                  } else {
                    onChange([...selected, m.email]);
                  }
                }}
              />
              <span className="truncate">{m.email}</span>
            </label>
          ))
        )}
      </div>
      {!allSelected && members.length > 0 ? (
        <p className="text-xs text-[var(--muted)]">
          Unchecked addresses are excluded from this send.
        </p>
      ) : null}
    </fieldset>
  );
}
