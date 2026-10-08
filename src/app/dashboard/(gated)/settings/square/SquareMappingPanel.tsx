"use client";

import { useState, useTransition } from "react";
import {
  confirmSquareProductMapping,
  loadSquareMatchSuggestions,
} from "./actions";

type Suggestion = {
  productId: string;
  providerProductId: string;
  providerVariationId: string;
  confidence: string;
  productName: string;
  squareName: string;
  competing: number;
};

const MATCH_LABEL: Record<string, string> = {
  exact_sku: "Same SKU",
  exact_upc: "Same barcode",
  exact_name: "Same name",
};

export default function SquareMappingPanel({
  catalogEnabled,
}: {
  catalogEnabled: boolean;
}) {
  const [pending, start] = useTransition();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [count, setCount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  if (!catalogEnabled) {
    return (
      <p className="text-[var(--muted)]">
        Turn on product / catalogue sync to review Square matches.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        disabled={pending}
        className="rounded-lg border border-[var(--line)] px-4 py-2 text-sm font-semibold hover:bg-[var(--wash)]"
        onClick={() => {
          setError(null);
          setMessage(null);
          start(async () => {
            try {
              const result = await loadSquareMatchSuggestions();
              if ("error" in result && result.error) {
                setError(result.error);
                return;
              }
              if ("suggestions" in result) {
                setSuggestions(result.suggestions);
                setCount(result.squareItemCount);
              }
            } catch {
              setError("Could not load Square items. Try again.");
            }
          });
        }}
      >
        {pending ? "Loading…" : "Review matches"}
      </button>
      {count != null ? (
        <p className="text-[var(--muted)]">
          Found {count} Square item{count === 1 ? "" : "s"}.{" "}
          {suggestions.length === 0
            ? "Nothing new to link: matching products are already linked."
            : `${suggestions.length} exact match${suggestions.length === 1 ? "" : "es"} to review.`}
        </p>
      ) : null}
      {error ? <p className="text-red-700">{error}</p> : null}
      {message ? <p className="text-[var(--ok)]">{message}</p> : null}
      <ul className="space-y-2">
        {suggestions.map((s) => (
          <li
            key={`${s.productId}-${s.providerVariationId}`}
            className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[var(--line)] p-3"
          >
            <span className="min-w-0">
              <span className="block font-medium">
                {s.squareName} <span className="text-[var(--muted)]">→</span> {s.productName}
              </span>
              <span className="block text-xs text-[var(--muted)]">
                Square item → Vendl product · {MATCH_LABEL[s.confidence] ?? s.confidence}
                {s.competing > 1
                  ? ` · ${s.competing} Square items match this product, so link only one (the others may be duplicates in Square)`
                  : ""}
              </span>
            </span>
            <button
              type="button"
              disabled={pending}
              className="rounded-lg bg-[var(--leaf)] px-3 py-1.5 text-xs font-semibold text-white"
              onClick={() => {
                setError(null);
                start(async () => {
                  try {
                    const res = await confirmSquareProductMapping(s);
                    if ("error" in res && res.error) {
                      setError(res.error);
                      return;
                    }
                    setSuggestions((prev) =>
                      prev.filter(
                        (x) =>
                          x.productId !== s.productId &&
                          x.providerVariationId !== s.providerVariationId,
                      ),
                    );
                    setMessage(`Linked ${s.squareName} to ${s.productName}.`);
                  } catch {
                    setError("Could not link. Try again.");
                  }
                });
              }}
            >
              Link
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
