import type { WebAddressPreview } from "@/lib/storefront/web-address";
import { ADDRESS_LOCKED_MESSAGE } from "@/lib/storefront/web-address-copy";

export default function WebAddressHint({
  preview,
  label = "Your website address",
}: {
  preview: WebAddressPreview | null;
  label?: string;
}) {
  if (!preview) return null;
  if (preview.locked) {
    return (
      <p className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">
        {ADDRESS_LOCKED_MESSAGE}
      </p>
    );
  }
  return (
    <p className="text-sm text-[var(--muted)]">
      {label}: <span className="font-medium text-[var(--field)]">{preview.host}</span>
      {preview.adjusted ? " (a number was added because that name is taken)" : null}
    </p>
  );
}
