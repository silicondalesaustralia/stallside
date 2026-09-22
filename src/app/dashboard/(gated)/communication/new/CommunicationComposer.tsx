"use client";

import { useState, useTransition } from "react";
import { createAndSendCommunication } from "../actions";
import CommunicationProductPicker from "./CommunicationProductPicker";

type CustomerOpt = { id: string; name: string | null; email: string | null };
type ProductOpt = { id: string; name: string };

export default function CommunicationComposer({
  customers,
  products,
  initialCustomerId,
}: {
  customers: CustomerOpt[];
  products: ProductOpt[];
  initialCustomerId: string | null;
}) {
  const [audienceType, setAudienceType] = useState(
    initialCustomerId ? "customer" : "all_marketing",
  );
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      action={(fd) => {
        setMessage(null);
        startTransition(async () => {
          const result = await createAndSendCommunication(fd);
          if (result?.error) setMessage(result.error);
        });
      }}
      className="flex flex-col gap-4 rounded-xl border border-[var(--line)] bg-[var(--panel)] p-5"
    >
      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-semibold">Who</legend>
        {(
          [
            ["all_marketing", "Everyone opted into marketing"],
            ["product", "Bought these products"],
            ["customer", "One customer"],
          ] as const
        ).map(([value, label]) => (
          <label key={value} className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="audienceType"
              value={value}
              checked={audienceType === value}
              onChange={() => setAudienceType(value)}
            />
            {label}
          </label>
        ))}
      </fieldset>

      {audienceType === "product" ? (
        <CommunicationProductPicker
          products={products}
          selected={selectedProducts}
          onToggle={(id) =>
            setSelectedProducts((prev) =>
              prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
            )
          }
        />
      ) : null}

      {audienceType === "customer" ? (
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Customer</span>
          <select
            name="customerId"
            required
            defaultValue={initialCustomerId ?? ""}
            className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
          >
            <option value="">Select customer…</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name || c.email} {c.email ? `(${c.email})` : ""}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Subject</span>
        <input
          name="subject"
          required
          maxLength={200}
          className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Heading (optional)</span>
        <input
          name="heading"
          maxLength={200}
          className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Message</span>
        <textarea
          name="body"
          required
          rows={8}
          maxLength={8000}
          className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
        />
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Button label (optional)</span>
          <input
            name="ctaLabel"
            placeholder="Shop now"
            className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Button URL (optional)</span>
          <input
            name="ctaUrl"
            placeholder="https://"
            className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
          />
        </label>
      </div>

      {message ? <p className="text-sm text-[var(--warn)]">{message}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-[var(--leaf)] px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
      >
        {pending ? "Queueing…" : "Send"}
      </button>
    </form>
  );
}
