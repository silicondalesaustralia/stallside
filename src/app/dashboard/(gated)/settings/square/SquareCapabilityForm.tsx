"use client";

import { useTransition } from "react";
import { updateSquareCapabilities } from "./actions";
import { useActionStatus } from "./use-action-status";
import ActionStatusText from "./ActionStatusText";

const OPTIONS = [
  {
    name: "payments",
    label: "Online Vendl payments",
    hint: "Card checkout on your QR stall and website when Square is the product checkout provider.",
    checkedKey: "paymentsEnabled" as const,
  },
  {
    name: "inventory",
    label: "POS inventory sync",
    hint: "Keep stock matched both ways with your Square reader.",
    checkedKey: "inventorySyncEnabled" as const,
  },
  {
    name: "catalog",
    label: "Product / catalogue sync",
    hint: "Match, import and push products between Vendl and Square.",
    checkedKey: "catalogSyncEnabled" as const,
  },
] as const;

export default function SquareCapabilityForm({
  paymentsEnabled,
  inventorySyncEnabled,
  catalogSyncEnabled,
}: {
  paymentsEnabled: boolean;
  inventorySyncEnabled: boolean;
  catalogSyncEnabled: boolean;
}) {
  const [pending, start] = useTransition();
  const { status, report, fail } = useActionStatus();
  const checked = {
    paymentsEnabled,
    inventorySyncEnabled,
    catalogSyncEnabled,
  };

  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        start(async () => {
          try {
            const res = await updateSquareCapabilities({
              paymentsEnabled: fd.get("payments") === "on",
              inventorySyncEnabled: fd.get("inventory") === "on",
              catalogSyncEnabled: fd.get("catalog") === "on",
            });
            report(res, "Square settings saved.");
          } catch (error) {
            fail(error);
          }
        });
      }}
    >
      {OPTIONS.map((opt) => (
        <label key={opt.name} className="flex items-start gap-2">
          <input
            type="checkbox"
            name={opt.name}
            defaultChecked={checked[opt.checkedKey]}
            className="mt-1"
          />
          <span>
            <span className="font-medium">{opt.label}</span>
            <span className="mt-0.5 block text-[var(--muted)]">{opt.hint}</span>
          </span>
        </label>
      ))}
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg border border-[var(--line)] bg-white px-4 py-2 text-sm font-semibold hover:bg-[var(--wash)] disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save"}
      </button>
      <ActionStatusText status={status} />
    </form>
  );
}
