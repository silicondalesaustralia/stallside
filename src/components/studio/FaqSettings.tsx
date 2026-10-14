"use client";

import { FAQ_MAX_ITEMS, parseFaqItems, type FaqItem } from "@/lib/studio/faq-items";
import { newMenuId } from "@/lib/studio/header-menu";
import type { CraftFaqProps } from "@/components/studio/sections/CraftFaqSection";
import FaqItemRow from "./FaqItemRow";

/** FAQ section settings: open behaviour and the list of questions. */
export default function FaqSettings({
  props,
  setProp,
}: {
  props: CraftFaqProps;
  setProp: (k: string, v: unknown) => void;
}) {
  const items = parseFaqItems(props.items);
  const setItems = (next: FaqItem[]) => setProp("items", next);

  function move(i: number, delta: -1 | 1) {
    const next = [...items];
    const [item] = next.splice(i, 1);
    if (item) next.splice(i + delta, 0, item);
    setItems(next);
  }

  return (
    <>
      <p className="text-xs text-[var(--muted)]">
        Edit the heading and intro directly on the page. Answers support **bold**, _italic_ and [links](https://…).
      </p>
      <fieldset className="space-y-1.5">
        <legend className="mb-1.5 block text-xs font-semibold text-[var(--field)]">Answers</legend>
        <label className="flex items-center gap-2 text-sm">
          <input type="radio" name="faqStartOpen" checked={!props.startOpen} onChange={() => setProp("startOpen", false)} />
          Hidden until the question is clicked
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="radio" name="faqStartOpen" checked={props.startOpen} onChange={() => setProp("startOpen", true)} />
          Open by default (can still be closed)
        </label>
      </fieldset>
      <div className="space-y-2">
        {items.map((item, i) => (
          <FaqItemRow
            key={item.id}
            item={item}
            index={i}
            count={items.length}
            onChange={(next) => setItems(items.map((it) => (it.id === item.id ? next : it)))}
            onMove={(delta) => move(i, delta)}
            onRemove={() => setItems(items.filter((it) => it.id !== item.id))}
          />
        ))}
      </div>
      {items.length < FAQ_MAX_ITEMS ? (
        <button
          type="button"
          className="w-full rounded-lg border border-dashed border-[var(--line)] px-3 py-2 text-sm font-semibold text-[var(--field)]"
          onClick={() => setItems([...items, { id: newMenuId(), question: "", answer: "" }])}
        >
          + Add question
        </button>
      ) : (
        <p className="text-xs text-[var(--muted)]">You&apos;ve reached the limit of {FAQ_MAX_ITEMS} questions.</p>
      )}
    </>
  );
}
