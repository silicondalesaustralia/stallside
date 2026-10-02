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
            const result = await loadSquareMatchSuggestions();
            if ("error" in result && result.error) {
              setError(result.error);
              return;
            }
            if ("suggestions" in result) {
              setSuggestions(result.suggestions);
              setCount(result.squareItemCount);
            }
          });
        }}
      >
        {pending ? "Loading…" : "Review matches"}
      </button>
      {count != null ? (
        <p className="text-[var(--muted)]">
          Found {count} Square item{count === 1 ? "" : "s"}. {suggestions.length}{" "}
          exact match suggestion{suggestions.length === 1 ? "" : "s"}.
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
            <span className="text-xs text-[var(--muted)]">
              {s.confidence.replaceAll("_", " ")} · product {s.productId.slice(0, 8)}…
            </span>
            <button
              type="button"
              disabled={pending}
              className="rounded-lg bg-[var(--leaf)] px-3 py-1.5 text-xs font-semibold text-white"
              onClick={() => {
                start(async () => {
                  const res = await confirmSquareProductMapping(s);
                  if ("error" in res && res.error) setError(res.error);
                  else setMessage("Mapping confirmed.");
                });
              }}
            >
              Confirm mapping
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
