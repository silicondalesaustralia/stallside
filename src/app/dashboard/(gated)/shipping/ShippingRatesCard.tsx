import { SHIPPING_MODE_LABELS, type ShippingModeValue } from "@/lib/shipping/shipping-cost";
import { saveShippingRates } from "./shipping-rate-actions";

const MODES: { value: ShippingModeValue; hint: string }[] = [
  { value: "FREE", hint: "No shipping charge." },
  { value: "FLAT", hint: "One amount per order." },
  { value: "CUSTOM", hint: "Each product's shipping cost × quantity. Set it on each product." },
];

const STATUS_TEXT: Record<string, { tone: string; text: string }> = {
  saved: { tone: "text-[var(--ok)]", text: "Saved." },
  flat: { tone: "text-[var(--gone)]", text: "Enter the flat rate amount." },
  invalid: { tone: "text-[var(--gone)]", text: "Check the amounts and try again." },
  error: { tone: "text-[var(--gone)]", text: "Could not save. Try again." },
};

function dollars(cents: number | null): string {
  return cents ? (cents / 100).toFixed(2) : "";
}

export default function ShippingRatesCard({
  standId,
  mode,
  flatCents,
  freeOverCents,
  currency,
  status,
}: {
  standId: string;
  mode: ShippingModeValue;
  flatCents: number;
  freeOverCents: number | null;
  currency: string;
  status?: string;
}) {
  const notice = status ? STATUS_TEXT[status] : undefined;
  const input = "w-32 rounded-lg border border-[var(--line)] bg-white px-3 py-2";
  return (
    <section className="dash-card flex flex-col gap-4 p-5">
      <div>
        <h2 className="text-lg font-semibold">Shipping rates</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Charged on shop orders that ship. Pre-order pages keep their own delivery terms.
        </p>
      </div>
      <form action={saveShippingRates.bind(null, standId)} className="flex flex-col gap-4">
        <fieldset className="flex flex-col gap-2">
          {MODES.map((m) => (
            <label key={m.value} className="flex items-start gap-2 text-sm">
              <input type="radio" name="shippingMode" value={m.value} defaultChecked={mode === m.value} className="mt-1" />
              <span>
                <span className="font-semibold">{SHIPPING_MODE_LABELS[m.value]}</span>
                <span className="block text-[var(--muted)]">{m.hint}</span>
              </span>
            </label>
          ))}
        </fieldset>
        <div className="flex flex-wrap gap-4">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-semibold">Flat rate ({currency})</span>
            <input name="shippingFlat" inputMode="decimal" defaultValue={dollars(flatCents)} placeholder="9.95" className={input} />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-semibold">Free shipping over ({currency})</span>
            <input name="shippingFreeOver" inputMode="decimal" defaultValue={dollars(freeOverCents)} placeholder="Optional" className={input} />
          </label>
        </div>
        <div className="flex items-center gap-3">
          <button type="submit" className="rounded-full bg-[var(--leaf)] px-4 py-2 text-sm font-semibold text-white">
            Save rates
          </button>
          {notice ? <p className={`text-sm ${notice.tone}`}>{notice.text}</p> : null}
        </div>
      </form>
    </section>
  );
}
