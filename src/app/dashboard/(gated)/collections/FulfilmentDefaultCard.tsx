import { FULFILMENT_CHOICE_LABELS, type FulfilmentChoiceValue } from "@/lib/fulfilment/handover-choice";
import { saveFulfilmentDefault } from "./fulfilment-default-actions";

const CHOICES: FulfilmentChoiceValue[] = ["PICKUP", "DELIVERY", "BOTH"];

const STATUS_TEXT: Record<string, { tone: string; text: string }> = {
  saved: { tone: "text-[var(--ok)]", text: "Saved." },
  invalid: { tone: "text-[var(--gone)]", text: "Choose pickup, delivery or both." },
  error: { tone: "text-[var(--gone)]", text: "Could not save. Try again." },
};

/** Site-wide pickup / delivery for take-now products; each product can override it. */
export default function FulfilmentDefaultCard({
  standId,
  value,
  status,
}: {
  standId: string;
  value: FulfilmentChoiceValue;
  status?: string;
}) {
  const notice = status ? STATUS_TEXT[status] : undefined;
  return (
    <section className="collections-screen-only dash-card flex flex-col gap-3 p-5">
      <div>
        <h2 className="text-lg font-semibold">Pickup &amp; delivery for your shop</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Applies to every product unless you change it on the product. With both on, customers choose at
          checkout. Delivery orders give their address and pay by card. Pre-order pages keep their own
          setting.
        </p>
      </div>
      <form action={saveFulfilmentDefault.bind(null, standId)} className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-semibold">Customers can</span>
          <select
            name="fulfilmentDefault"
            defaultValue={value}
            className="rounded-lg border border-[var(--line)] bg-white px-3 py-2"
          >
            {CHOICES.map((choice) => (
              <option key={choice} value={choice}>
                {FULFILMENT_CHOICE_LABELS[choice]}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className="rounded-full bg-[var(--leaf)] px-4 py-2 text-sm font-semibold text-white">
          Save
        </button>
        {notice ? <p className={`text-sm ${notice.tone}`}>{notice.text}</p> : null}
      </form>
    </section>
  );
}
