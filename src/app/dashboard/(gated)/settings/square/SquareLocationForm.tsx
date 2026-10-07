"use client";

import { useTransition } from "react";
import {
  mapSquareLocationToStand,
  setPrimarySquareLocation,
} from "./actions";
import { useActionStatus } from "./use-action-status";
import ActionStatusText from "./ActionStatusText";

export default function SquareLocationForm({
  locations,
  stands,
  primaryLocationId,
}: {
  locations: Array<{
    id: string;
    name: string;
    standId: string | null;
    isPrimary: boolean;
  }>;
  stands: Array<{ id: string; name: string }>;
  primaryLocationId: string | null;
}) {
  const [pending, start] = useTransition();
  const { status, report, fail } = useActionStatus();

  return (
    <div className="space-y-4">
      <form
        className="flex flex-wrap items-end gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          const id = String(fd.get("primary") ?? "");
          const name = locations.find((l) => l.id === id)?.name ?? "Location";
          start(async () => {
            try {
              report(await setPrimarySquareLocation(id), `${name} saved as primary location.`);
            } catch (error) {
              fail(error);
            }
          });
        }}
      >
        <label className="flex flex-col gap-1 text-sm">
          Primary sync location
          <select
            name="primary"
            defaultValue={primaryLocationId ?? locations[0]?.id ?? ""}
            className="rounded-lg border border-[var(--line)] bg-white px-3 py-2"
          >
            {locations.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          disabled={pending || locations.length === 0}
          className="rounded-lg border border-[var(--line)] px-3 py-2 text-sm font-semibold hover:bg-[var(--wash)]"
        >
          Save location
        </button>
      </form>

      <ul className="space-y-3">
        {locations.map((l) => (
          <li key={l.id} className="rounded-xl border border-[var(--line)] p-3">
            <p className="font-medium">
              {l.name}
              {l.isPrimary ? " · primary" : ""}
            </p>
            <form
              className="mt-2 flex flex-wrap items-end gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                const standId = String(fd.get("standId") ?? "");
                const standName = stands.find((s) => s.id === standId)?.name;
                start(async () => {
                  try {
                    const res = await mapSquareLocationToStand({
                      providerLocationId: l.id,
                      standId: standId || null,
                    });
                    report(
                      res,
                      standName
                        ? `${l.name} mapped to ${standName}.`
                        : `${l.name} unmapped.`,
                    );
                  } catch (error) {
                    fail(error);
                  }
                });
              }}
            >
              <label className="flex flex-col gap-1 text-xs">
                Map to Vendl business
                <select
                  name="standId"
                  defaultValue={l.standId ?? ""}
                  className="rounded-lg border border-[var(--line)] bg-white px-2 py-1.5"
                >
                  <option value="">Unmapped</option>
                  {stands.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="submit"
                disabled={pending}
                className="rounded-lg border border-[var(--line)] px-2 py-1.5 text-xs font-semibold"
              >
                Map
              </button>
            </form>
          </li>
        ))}
      </ul>
      <ActionStatusText status={status} />
    </div>
  );
}
