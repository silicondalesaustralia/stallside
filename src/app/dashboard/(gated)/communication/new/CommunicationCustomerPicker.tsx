"use client";

import { useMemo, useState } from "react";

type CustomerOpt = { id: string; name: string | null; email: string | null };

export default function CommunicationCustomerPicker({
  customers,
  initialCustomerId,
}: {
  customers: CustomerOpt[];
  initialCustomerId: string | null;
}) {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(initialCustomerId ?? "");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter((c) => {
      const hay = `${c.name ?? ""} ${c.email ?? ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [customers, query]);

  const options = useMemo(() => {
    if (!selectedId) return filtered;
    if (filtered.some((c) => c.id === selectedId)) return filtered;
    const selected = customers.find((c) => c.id === selectedId);
    return selected ? [selected, ...filtered] : filtered;
  }, [customers, filtered, selectedId]);

  return (
    <div className="flex flex-col gap-2 text-sm">
      <span className="font-medium">Customer</span>
      {customers.length > 8 ? (
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name or email…"
          className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
        />
      ) : null}
      <select
        name="customerId"
        required
        value={selectedId}
        onChange={(e) => setSelectedId(e.target.value)}
        className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
      >
        <option value="">Select customer…</option>
        {options.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name || c.email}
            {c.name && c.email ? ` (${c.email})` : ""}
          </option>
        ))}
      </select>
      <p className="text-xs text-[var(--muted)]">
        {customers.length === 0
          ? "No customers with an email yet."
          : `${options.length} of ${customers.length} with email`}
      </p>
    </div>
  );
}
