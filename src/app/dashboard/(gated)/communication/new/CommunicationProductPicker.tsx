"use client";

type ProductOpt = { id: string; name: string };

export default function CommunicationProductPicker({
  products,
  selected,
  onToggle,
}: {
  products: ProductOpt[];
  selected: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="text-sm font-medium">Products</legend>
      <p className="text-xs text-[var(--muted)]">
        Anyone who bought at least one of the selected products.
      </p>
      <div className="max-h-56 space-y-1.5 overflow-y-auto rounded-lg border border-[var(--line)] bg-white p-3">
        {products.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">No products yet.</p>
        ) : (
          products.map((p) => (
            <label
              key={p.id}
              className="flex cursor-pointer items-center gap-2 text-sm"
            >
              <input
                type="checkbox"
                name="productId"
                value={p.id}
                checked={selected.includes(p.id)}
                onChange={() => onToggle(p.id)}
              />
              <span>{p.name}</span>
            </label>
          ))
        )}
      </div>
      {selected.length > 0 ? (
        <p className="text-xs text-[var(--muted)]">{selected.length} selected</p>
      ) : null}
    </fieldset>
  );
}
