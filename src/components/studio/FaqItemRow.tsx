"use client";

import { WEBSITE_LIMITS } from "@/lib/website/schema/limits";
import { FAQ_QUESTION_MAX, type FaqItem } from "@/lib/studio/faq-items";

const INPUT = "w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm";
const ICON_BTN = "rounded border border-[var(--line)] px-2 text-xs disabled:opacity-30";

/** One question and its answer in the FAQ settings. */
export default function FaqItemRow({
  item,
  index,
  count,
  onChange,
  onMove,
  onRemove,
}: {
  item: FaqItem;
  index: number;
  count: number;
  onChange: (next: FaqItem) => void;
  onMove: (delta: -1 | 1) => void;
  onRemove: () => void;
}) {
  return (
    <div className="space-y-2 rounded-lg border border-[var(--line)] bg-[var(--cream,#fafaf7)] p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold text-[var(--field)]">Question {index + 1}</p>
        <div className="flex gap-1">
          <button type="button" className={ICON_BTN} disabled={index === 0} onClick={() => onMove(-1)} aria-label="Move question up">
            ↑
          </button>
          <button
            type="button"
            className={ICON_BTN}
            disabled={index === count - 1}
            onClick={() => onMove(1)}
            aria-label="Move question down"
          >
            ↓
          </button>
          <button type="button" className="px-1 text-xs font-semibold text-red-700" onClick={onRemove}>
            Remove
          </button>
        </div>
      </div>
      <input
        className={INPUT}
        maxLength={FAQ_QUESTION_MAX}
        aria-label={`Question ${index + 1}`}
        placeholder="Type the question, e.g. When can I collect my order?"
        value={item.question}
        onChange={(e) => onChange({ ...item, question: e.target.value })}
      />
      <textarea
        className={INPUT}
        rows={4}
        maxLength={WEBSITE_LIMITS.bodyChars}
        aria-label={`Answer ${index + 1}`}
        placeholder="Type the answer"
        value={item.answer}
        onChange={(e) => onChange({ ...item, answer: e.target.value })}
      />
    </div>
  );
}
