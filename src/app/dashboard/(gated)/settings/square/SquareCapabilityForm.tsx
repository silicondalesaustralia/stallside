"use client";

import { useTransition } from "react";
import { updateSquareCapabilities } from "./actions";
import { useActionStatus } from "./use-action-status";
import ActionStatusText from "./ActionStatusText";

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
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          name="payments"
          defaultChecked={paymentsEnabled}
        />
        Online Vendl payments
      </label>
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          name="inventory"
          defaultChecked={inventorySyncEnabled}
        />
        POS inventory sync
      </label>
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          name="catalog"
          defaultChecked={catalogSyncEnabled}
        />
        Product / catalogue sync
      </label>
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
