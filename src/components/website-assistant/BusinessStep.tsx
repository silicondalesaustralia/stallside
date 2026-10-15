"use client";

import { PRIMARY_GOALS, type BriefData, type PrimaryGoal } from "@/lib/website-ai/assistant/brief/schema";
import AssistantField from "./AssistantField";
import FollowUpQuestions from "./FollowUpQuestions";
import ImportSources from "./ImportSources";
import { GOAL_LABELS, inputClass, type BriefUpdater } from "./assistant-copy";

type Props = { brief: BriefData; update: BriefUpdater; aiAvailable: boolean };

export default function BusinessStep({ brief, update, aiAvailable }: Props) {
  const b = brief.business;
  const set = <K extends keyof BriefData["business"]>(key: K, value: BriefData["business"][K]) =>
    update((prev) => ({ ...prev, business: { ...prev.business, [key]: value } }));

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-[var(--muted)]">
        We&apos;ve filled in what Vendl already knows. Check it, then add anything customers should know.
      </p>
      <AssistantField label="Business name" value={b.name} maxLength={120} onChange={(v) => set("name", v)} />
      <AssistantField
        label="What does your business do?"
        hint="One or two sentences, in your own words."
        multiline
        value={b.description}
        maxLength={600}
        onChange={(v) => set("description", v)}
      />
      <AssistantField label="What do you sell or offer?" multiline value={b.offering} maxLength={600} onChange={(v) => set("offering", v)} />
      <label className="block text-sm">
        <span className="font-medium text-[var(--field)]">Main goal of your website</span>
        <select
          className={inputClass}
          value={b.primaryGoal ?? ""}
          onChange={(e) => set("primaryGoal", e.target.value ? (e.target.value as PrimaryGoal) : null)}
        >
          <option value="">Choose one…</option>
          {PRIMARY_GOALS.map((g) => (
            <option key={g} value={g}>
              {GOAL_LABELS[g]}
            </option>
          ))}
        </select>
      </label>
      <AssistantField label="Who are your customers?" value={b.audience} maxLength={300} onChange={(v) => set("audience", v)} />
      <AssistantField label="Your story" hint="How you started, who's behind it." multiline value={b.story} maxLength={2000} onChange={(v) => set("story", v)} />
      <AssistantField label="What makes you different?" multiline value={b.differentiators} maxLength={600} onChange={(v) => set("differentiators", v)} />
      <AssistantField label="Area you serve" value={b.serviceArea} maxLength={200} onChange={(v) => set("serviceArea", v)} />
      <label className="flex items-center gap-2 text-sm text-[var(--field)]">
        <input type="checkbox" checked={b.showPhone} onChange={(e) => set("showPhone", e.target.checked)} />
        Show my phone number on the website
      </label>
      <AssistantField
        label="Anything else the website should say or avoid?"
        multiline
        value={b.instructions}
        maxLength={1000}
        onChange={(v) => set("instructions", v)}
      />
      {aiAvailable ? <ImportSources brief={brief} update={update} /> : null}
      {aiAvailable ? <FollowUpQuestions brief={brief} update={update} /> : null}
    </div>
  );
}
