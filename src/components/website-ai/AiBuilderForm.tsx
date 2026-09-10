"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import {
  generateAiWebsiteDraft,
  type AiGenerateState,
} from "@/app/dashboard/(gated)/website/ai/actions";
import type { WebsiteIntakeNeeds } from "@/lib/website-ai/assess-context";

const initial: AiGenerateState = { ok: false };

const STYLE_OPTIONS = [
  { id: "vendl-decide", label: "Let Vendl decide" },
  { id: "rustic", label: "Rustic / local" },
  { id: "premium", label: "Premium / artisan" },
  { id: "modern", label: "Clean / modern" },
  { id: "market", label: "Bold / market" },
] as const;

const inputClass =
  "mt-1 w-full rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm";

function ChoiceChip({
  label,
  selected,
  onSelect,
}: {
  label: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={
        selected
          ? "rounded-md border border-[var(--field)] bg-[var(--field)] px-3 py-2 text-sm font-medium text-white"
          : "rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--field)] hover:border-[var(--field)]"
      }
    >
      {label}
    </button>
  );
}

export default function AiBuilderForm({
  focusOptions,
  previewPath,
  suggestedQuestions,
  readiness,
  intake,
}: {
  focusOptions: { id: string; label: string }[];
  previewPath: string;
  suggestedQuestions: string[];
  readiness: string;
  intake: WebsiteIntakeNeeds;
}) {
  const [state, action, pending] = useActionState(generateAiWebsiteDraft, initial);
  const [focus, setFocus] = useState("vendl-decide");
  const [style, setStyle] = useState("vendl-decide");
  const resolvedPreview = state.previewPath ?? previewPath;

  return (
    <div className="flex flex-col gap-6">
      <form
        action={action}
        encType="multipart/form-data"
        className="flex flex-col gap-5"
      >
        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-medium text-[var(--field)]">
            What should your website focus on?
          </legend>
          <p className="text-xs text-[var(--muted)]">
            Context readiness: {readiness.replaceAll("_", " ").toLowerCase()}
          </p>
          <div className="flex flex-wrap gap-2">
            {focusOptions.map((opt) => (
              <ChoiceChip
                key={opt.id}
                label={opt.label}
                selected={focus === opt.id}
                onSelect={() => setFocus(opt.id)}
              />
            ))}
          </div>
          <input type="hidden" name="focus" value={focus} />
        </fieldset>

        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-medium text-[var(--field)]">Style</legend>
          <div className="flex flex-wrap gap-2">
            {STYLE_OPTIONS.map((opt) => (
              <ChoiceChip
                key={opt.id}
                label={opt.label}
                selected={style === opt.id}
                onSelect={() => setStyle(opt.id)}
              />
            ))}
          </div>
          <input type="hidden" name="style" value={style} />
        </fieldset>

        {(intake.askAbout || intake.askHeroImage || intake.askStoryImage) && (
          <div className="flex flex-col gap-4 rounded-md border border-[var(--border)] bg-[var(--surface)] px-4 py-4">
            <div>
              <p className="text-sm font-medium text-[var(--field)]">
                A few details make a much better site
              </p>
              <p className="mt-1 text-xs text-[var(--muted)]">
                Optional — you can skip and still build a draft.
              </p>
            </div>

            {intake.askAbout ? (
              <label className="block text-sm">
                <span className="font-medium text-[var(--field)]">
                  Your story / About us
                </span>
                <span className="mt-0.5 block text-xs text-[var(--muted)]">
                  What makes your business different? History, what you grow or bake,
                  why locals come back.
                </span>
                <textarea
                  name="about"
                  rows={4}
                  defaultValue={intake.existingAbout}
                  placeholder="e.g. We grow seasonal veg and bake sourdough for our roadside stand…"
                  className={inputClass}
                />
              </label>
            ) : null}

            {intake.askHeroImage ? (
              <label className="block text-sm">
                <span className="font-medium text-[var(--field)]">
                  Hero photo
                </span>
                <span className="mt-0.5 block text-xs text-[var(--muted)]">
                  Main homepage image — farm, stand, bakery, or best product shot.
                  {intake.hasHeroImage ? " Upload to replace the current hero." : ""}
                </span>
                <input
                  name="heroImage"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className={inputClass}
                />
              </label>
            ) : null}

            {intake.askStoryImage ? (
              <label className="block text-sm">
                <span className="font-medium text-[var(--field)]">
                  About / story photo
                </span>
                <span className="mt-0.5 block text-xs text-[var(--muted)]">
                  A second photo for the story section (you, the farm, the kitchen…).
                </span>
                <input
                  name="storyImage"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className={inputClass}
                />
              </label>
            ) : null}
          </div>
        )}

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-[var(--field)]">
            Anything else for Vendl?
          </span>
          <textarea
            name="notes"
            rows={3}
            placeholder={
              suggestedQuestions[0] ??
              "e.g. Warm country-style site focused on our farm stand and fresh eggs."
            }
            className={inputClass}
          />
        </label>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-[var(--field)] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {pending ? "Building your website…" : "Build my website"}
          </button>
          <Link
            href="/dashboard/website/studio"
            className="text-sm text-[var(--muted)] underline"
          >
            Use classic studio instead
          </Link>
        </div>
      </form>

      {state.error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
          <p className="font-medium">We couldn&apos;t finish the website draft.</p>
          <p className="mt-1">{state.error}</p>
          {state.details?.length ? (
            <ul className="mt-2 list-disc pl-5 text-xs">
              {state.details.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          ) : null}
          <p className="mt-2 text-xs">Your existing live website has not been changed.</p>
        </div>
      ) : null}

      {state.ok ? (
        <div className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-4 py-4 text-sm">
          <p className="font-medium text-[var(--field)]">Your draft website is ready.</p>
          <p className="mt-1 text-[var(--muted)]">{state.summary}</p>
          {state.designSystem ? (
            <p className="mt-1 text-xs text-[var(--muted)]">
              Design system: {state.designSystem}
              {state.provider ? ` · ${state.provider}` : ""}
            </p>
          ) : null}
          {state.missing?.length ? (
            <ul className="mt-3 list-disc pl-5 text-[var(--muted)]">
              {state.missing.map((m) => (
                <li key={m.code}>{m.message}</li>
              ))}
            </ul>
          ) : null}
          <div className="mt-4 flex flex-wrap gap-3">
            <a
              href={resolvedPreview}
              target="_blank"
              rel="noreferrer"
              className="rounded-md bg-[var(--field)] px-4 py-2 text-sm font-medium text-white"
            >
              Open customer preview
            </a>
            <Link
              href="/dashboard/website/studio"
              className="rounded-md border border-[var(--border)] px-4 py-2 text-sm"
            >
              Open drag-and-drop editor
            </Link>
          </div>
          <p className="mt-2 text-xs text-[var(--muted)]">
            Preview shows the public storefront. The editor is only for manual section
            tweaks.
          </p>
        </div>
      ) : null}
    </div>
  );
}
