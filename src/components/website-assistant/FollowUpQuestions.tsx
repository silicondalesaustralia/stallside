"use client";

import { useState, useTransition } from "react";
import { followUpsAction } from "@/app/dashboard/(gated)/website/assistant/actions";
import type { BriefData } from "@/lib/website-ai/assistant/brief/schema";
import AssistantField from "./AssistantField";
import { secondaryButton, type BriefUpdater } from "./assistant-copy";

type Props = { brief: BriefData; update: BriefUpdater };

export default function FollowUpQuestions({ brief, update }: Props) {
  const [pending, start] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const ask = () =>
    start(async () => {
      setMessage(null);
      const res = await followUpsAction(brief);
      if (!res.ok) return setMessage(res.error);
      if (res.questions.length === 0) return setMessage("Nothing else needed — your details look complete.");
      update((prev) => {
        const answered = prev.followUps.filter((f) => f.answer.trim());
        const fresh = res.questions
          .filter((q) => !answered.some((a) => a.id === q.id))
          .map((q) => ({ ...q, answer: "" }));
        return { ...prev, followUps: [...answered, ...fresh].slice(0, 6) };
      });
    });

  const setAnswer = (id: string, answer: string) =>
    update((prev) => ({ ...prev, followUps: prev.followUps.map((f) => (f.id === id ? { ...f, answer } : f)) }));

  return (
    <section className="rounded-md border border-[var(--border)] px-4 py-4">
      <h3 className="text-sm font-medium text-[var(--field)]">A few quick questions</h3>
      <p className="mt-1 text-xs text-[var(--muted)]">Optional. We&apos;ll ask up to 3 things that would improve your website.</p>
      <div className="mt-3 flex flex-col gap-3">
        {brief.followUps.map((f) => (
          <AssistantField key={f.id} label={f.question} multiline value={f.answer} maxLength={1000} onChange={(v) => setAnswer(f.id, v)} />
        ))}
      </div>
      <button type="button" className={`${secondaryButton} mt-3`} disabled={pending} onClick={ask}>
        {pending ? "Thinking…" : brief.followUps.length > 0 ? "Check again" : "Ask me questions"}
      </button>
      {message ? <p className="mt-2 text-xs text-[var(--muted)]">{message}</p> : null}
    </section>
  );
}
