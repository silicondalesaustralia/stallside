import type { StudioMetadata } from "@/lib/studio/types";
import { formatMoney } from "@/lib/public-product";

type Props = {
  preset: "simple" | "split" | "cards" | "visit-stand" | "info-band";
  heading: string;
  metadata: StudioMetadata;
  isEditing?: boolean;
};

function normalizePickupPreset(preset: Props["preset"]): "simple" | "split" | "cards" {
  if (preset === "visit-stand" || preset === "info-band") return "cards";
  return preset;
}

function pickupSummary(
  opt: StudioMetadata["fulfilmentOptions"][number],
  currency: string,
): string[] {
  const lines: string[] = [];
  if (opt.pickupLocation?.publicLabel) {
    lines.push(opt.pickupLocation.publicLabel);
  } else if (opt.pickupLocation?.suburb) {
    lines.push(opt.pickupLocation.suburb);
  }
  if (opt.pickupWindow?.label) lines.push(opt.pickupWindow.label);
  if (opt.feeCents > 0) lines.push(formatMoney(opt.feeCents, currency));
  return lines;
}

export default function StudioPickupBlock({
  preset,
  heading,
  metadata: meta,
  isEditing,
}: Props) {
  const viewPreset = normalizePickupPreset(preset);
  const options = meta.fulfilmentOptions;

  if (options.length === 0) {
    if (!isEditing) return null;
    return (
      <section className="studio-section studio-section--wash">
        <div className="studio-section__inner">
          <h2 className="studio-heading">{heading || "Pickup & delivery"}</h2>
          <p className="mt-3 text-sm text-[var(--muted)]">
            Set up pickup or delivery in Fulfilment settings to show details here.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="studio-section studio-section--wash">
      <div className="studio-section__inner">
        <h2 className="studio-heading">{heading || "Pickup & delivery"}</h2>
        <ul className={`mt-8 grid gap-4 ${viewPreset === "simple" ? "grid-cols-1 max-w-xl" : "sm:grid-cols-2"}`}>
          {options.map((opt) => {
            const details =
              opt.kind === "DELIVERY" && opt.deliveryZone
                ? [
                    opt.deliveryZone.name,
                    opt.deliveryZone.deliveryFeeCents > 0
                      ? `Delivery from ${formatMoney(opt.deliveryZone.deliveryFeeCents, meta.currency)}`
                      : "Delivery available",
                  ]
                : pickupSummary(opt, meta.currency);

            return (
              <li
                key={opt.id}
                className="rounded-[var(--studio-card-radius)] border border-[var(--line)] bg-white p-5"
              >
                <h3 className="font-semibold text-[var(--field)]">{opt.label}</h3>
                {details.length > 0 ? (
                  <ul className="mt-2 space-y-1 text-sm text-[var(--muted)]">
                    {details.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                ) : null}
              </li>
            );
          })}
        </ul>
        {meta.branding.regionLabel ? (
          <p className="mt-6 text-sm text-[var(--muted)]">{meta.branding.regionLabel}</p>
        ) : null}
      </div>
    </section>
  );
}
