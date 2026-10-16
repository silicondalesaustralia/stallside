"use client";

export default function AtStallToggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-start gap-2 text-sm">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-1" />
      <span>
        <span className="font-medium">This poster is at the stall</span>
        <span className="block text-xs text-[var(--muted)]">
          Shoppers who scan it see &ldquo;Take it with you now&rdquo; at checkout, and shipping is hidden. Leave off for
          flyers, markets or anywhere the goods aren&apos;t right there.
        </span>
      </span>
    </label>
  );
}
