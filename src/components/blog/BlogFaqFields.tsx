"use client";

import { useState } from "react";
import type { BlogFaq } from "@/lib/blog/types";

const inputClass =
  "w-full rounded-[var(--radius)] border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none ring-[var(--leaf)] focus:ring-2";

/** Editable FAQ rows, serialised to a hidden JSON input. */
export default function BlogFaqFields({ name, defaultValue }: { name: string; defaultValue: BlogFaq[] }) {
  const [faqs, setFaqs] = useState<BlogFaq[]>(defaultValue);

  function update(index: number, patch: Partial<BlogFaq>) {
    setFaqs((prev) => prev.map((faq, i) => (i === index ? { ...faq, ...patch } : faq)));
  }

  const complete = faqs.filter((f) => f.question.trim() && f.answer.trim());

  return (
    <div className="flex flex-col gap-3">
      {faqs.map((faq, index) => (
        <div key={index} className="flex flex-col gap-2 rounded-lg border border-[var(--line)] p-3">
          <input
            value={faq.question}
            onChange={(e) => update(index, { question: e.target.value })}
            placeholder="Question"
            className={inputClass}
          />
          <textarea
            value={faq.answer}
            onChange={(e) => update(index, { answer: e.target.value })}
            placeholder="Answer"
            rows={3}
            className={inputClass}
          />
          <button
            type="button"
            onClick={() => setFaqs((prev) => prev.filter((_, i) => i !== index))}
            className="self-end text-xs font-semibold text-red-700 underline"
          >
            Remove
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => setFaqs((prev) => [...prev, { question: "", answer: "" }])}
        className="self-start text-sm font-semibold text-[var(--leaf-dark)] underline"
      >
        Add FAQ
      </button>
      <input type="hidden" name={name} value={JSON.stringify(complete)} />
    </div>
  );
}
