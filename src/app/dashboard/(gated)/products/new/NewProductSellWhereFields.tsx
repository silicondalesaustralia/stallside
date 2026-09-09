type StandOption = { id: string; name: string };

const inputClass =
  "rounded-lg border border-[var(--line)] bg-white px-3 py-2.5";

export default function NewProductSellWhereFields({
  stands,
  defaultStandId,
  defaultShowOnline,
}: {
  stands: StandOption[];
  defaultStandId?: string;
  defaultShowOnline: boolean;
}) {
  return (
    <>
      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium">Primary location</span>
        <select
          name="standId"
          defaultValue={defaultStandId ?? stands[0]?.id}
          className={inputClass}
        >
          {stands.map((stand) => (
            <option key={stand.id} value={stand.id}>
              {stand.name}
            </option>
          ))}
        </select>
      </label>
      <label className="flex items-start gap-3 text-sm">
        <input
          type="checkbox"
          name="sellOnStand"
          defaultChecked
          className="mt-0.5 size-4"
        />
        <span>
          <span className="font-medium">Farm stand</span>
          <span className="mt-1 block text-[var(--muted)]">
            QR / in-person catalog for this location.
          </span>
        </span>
      </label>
      <label className="flex items-start gap-3 text-sm">
        <input
          type="checkbox"
          name="showOnline"
          defaultChecked={defaultShowOnline}
          className="mt-0.5 size-4"
        />
        <span>
          <span className="font-medium">Website / online shop</span>
          <span className="mt-1 block text-[var(--muted)]">
            Show on your public online shop.
          </span>
        </span>
      </label>
      <label className="flex items-start gap-3 text-sm">
        <input
          type="checkbox"
          name="preOrderEligible"
          className="mt-0.5 size-4"
        />
        <span>
          <span className="font-medium">Pre-order pages</span>
          <span className="mt-1 block text-[var(--muted)]">
            You can add this to a pre-order page after saving.
          </span>
        </span>
      </label>
    </>
  );
}
