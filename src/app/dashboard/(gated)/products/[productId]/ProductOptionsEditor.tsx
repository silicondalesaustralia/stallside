"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  MAX_CHOICES_PER_GROUP,
  MAX_OPTION_GROUPS,
  type OptionGroupInput,
} from "@/lib/product-options";
import { saveProductOptions } from "../product-options-actions";

type DraftChoice = { name: string; priceDollars: string };
type DraftGroup = { name: string; choices: DraftChoice[] };

function emptyGroup(): DraftGroup {
  return { name: "", choices: [{ name: "", priceDollars: "0" }] };
}

export default function ProductOptionsEditor({
  productId,
  initial,
}: {
  productId: string;
  initial: { name: string; choices: { name: string; priceDeltaCents: number }[] }[];
}) {
  const router = useRouter();
  const [groups, setGroups] = useState<DraftGroup[]>(() =>
    initial.length
      ? initial.map((g) => ({
          name: g.name,
          choices: g.choices.map((c) => ({
            name: c.name,
            priceDollars: (c.priceDeltaCents / 100).toFixed(2),
          })),
        }))
      : [],
  );
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function toPayload(): OptionGroupInput[] {
    return groups.map((g) => ({
      name: g.name.trim(),
      choices: g.choices.map((c) => {
        const dollars = Number.parseFloat(c.priceDollars || "0");
        const cents = Number.isFinite(dollars)
          ? Math.round(dollars * 100)
          : 0;
        return { name: c.name.trim(), priceDeltaCents: Math.max(0, cents) };
      }),
    }));
  }

  function onSave() {
    setMessage(null);
    startTransition(async () => {
      const result = await saveProductOptions(productId, toPayload());
      if (result && "error" in result && result.error) {
        setMessage(result.error);
        return;
      }
      setMessage("Options saved.");
      router.refresh();
    });
  }

  return (
    <fieldset className="flex flex-col gap-3 rounded-lg border border-[var(--line)] p-4">
      <legend className="px-1 text-sm font-semibold">Options (variants)</legend>
      <p className="text-sm text-[var(--muted)]">
        Up to {MAX_OPTION_GROUPS} groups (e.g. Size, Flavour). Shared stock on
        the product. Leave empty for no options. With one group, each choice
        price is the full price (0 = use the product price). With multiple
        groups, choice prices are add-ons on top of the product price.
      </p>
      {groups.map((group, gi) => (
        <div
          key={gi}
          className="flex flex-col gap-2 rounded-lg border border-[var(--line)] bg-[var(--panel)] p-3"
        >
          <div className="flex items-center justify-between gap-2">
            <label className="flex flex-1 flex-col gap-1 text-sm">
              <span className="font-medium">Group name</span>
              <input
                value={group.name}
                onChange={(e) => {
                  const next = [...groups];
                  next[gi] = { ...group, name: e.target.value };
                  setGroups(next);
                }}
                placeholder="Size"
                maxLength={40}
                className="rounded-lg border border-[var(--line)] bg-white px-3 py-2"
              />
            </label>
            <button
              type="button"
              className="text-sm text-[var(--gone)] underline"
              onClick={() => setGroups(groups.filter((_, i) => i !== gi))}
            >
              Remove
            </button>
          </div>
          {group.choices.map((choice, ci) => (
            <div key={ci} className="flex flex-wrap items-end gap-2">
              <label className="flex min-w-[8rem] flex-1 flex-col gap-1 text-sm">
                <span className="font-medium">Choice</span>
                <input
                  value={choice.name}
                  onChange={(e) => {
                    const next = [...groups];
                    const choices = [...group.choices];
                    choices[ci] = { ...choice, name: e.target.value };
                    next[gi] = { ...group, choices };
                    setGroups(next);
                  }}
                  placeholder="Dozen"
                  maxLength={40}
                  className="rounded-lg border border-[var(--line)] bg-white px-3 py-2"
                />
              </label>
              <label className="flex w-28 flex-col gap-1 text-sm">
                <span className="font-medium">Price</span>
                <input
                  value={choice.priceDollars}
                  onChange={(e) => {
                    const next = [...groups];
                    const choices = [...group.choices];
                    choices[ci] = { ...choice, priceDollars: e.target.value };
                    next[gi] = { ...group, choices };
                    setGroups(next);
                  }}
                  inputMode="decimal"
                  className="rounded-lg border border-[var(--line)] bg-white px-3 py-2"
                />
              </label>
              <button
                type="button"
                className="pb-2 text-sm underline"
                disabled={group.choices.length <= 1}
                onClick={() => {
                  const next = [...groups];
                  next[gi] = {
                    ...group,
                    choices: group.choices.filter((_, i) => i !== ci),
                  };
                  setGroups(next);
                }}
              >
                ×
              </button>
            </div>
          ))}
          {group.choices.length < MAX_CHOICES_PER_GROUP ? (
            <button
              type="button"
              className="text-left text-sm text-[var(--leaf-dark)] underline"
              onClick={() => {
                const next = [...groups];
                next[gi] = {
                  ...group,
                  choices: [
                    ...group.choices,
                    { name: "", priceDollars: "0" },
                  ],
                };
                setGroups(next);
              }}
            >
              Add choice
            </button>
          ) : null}
        </div>
      ))}
      {groups.length < MAX_OPTION_GROUPS ? (
        <button
          type="button"
          className="text-left text-sm font-semibold text-[var(--leaf-dark)] underline"
          onClick={() => setGroups([...groups, emptyGroup()])}
        >
          Add option group
        </button>
      ) : null}
      {message ? (
        <p
          className={`text-sm ${
            message === "Options saved."
              ? "text-[var(--leaf-dark)]"
              : "text-[var(--warn)]"
          }`}
        >
          {message}
        </p>
      ) : null}
      <button
        type="button"
        disabled={pending}
        onClick={onSave}
        className="rounded-lg border border-[var(--line)] px-4 py-2.5 text-sm font-semibold disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save options"}
      </button>
    </fieldset>
  );
}
