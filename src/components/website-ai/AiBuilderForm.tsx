"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import {
  generateAiWebsiteDraft,
  type AiGenerateState,
} from "@/app/dashboard/(gated)/website/ai/actions";
import type { WebsiteIntakeNeeds } from "@/lib/website-ai/assess-context";

const initial: AiGenerateState = { ok: false };

const FEEL_OPTIONS = [
  { id: "vendl-decide", label: "Let Vendl decide" },
  { id: "warm-local", label: "Warm & local" },
  { id: "premium-handcrafted", label: "Premium & handcrafted" },
  { id: "clean-modern", label: "Clean & modern" },
  { id: "bold-energetic", label: "Bold & energetic" },
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
  intake,
  knownFacts,
  businessName,
  path,
}: {
  focusOptions: { id: string; label: string }[];
  previewPath: string;
  suggestedQuestions: string[];
  intake: WebsiteIntakeNeeds;
  knownFacts: string[];
  businessName: string;
  path: "A" | "B" | "C";
}) {
  const [state, action, pending] = useActionState(generateAiWebsiteDraft, initial);
  const [focus, setFocus] = useState("vendl-decide");
  const [feel, setFeel] = useState("vendl-decide");
  const [skipPhotos, setSkipPhotos] = useState(false);
  const resolvedPreview = state.previewPath ?? previewPath;

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-md border border-[var(--border)] px-4 py-4 text-sm">
        <p className="font-medium text-[var(--field)]">{businessName}</p>
        <p className="mt-1 text-[var(--muted)]">We&apos;ll build your website using:</p>
        {knownFacts.length > 0 ? (
          <ul className="mt-2 grid gap-1 text-[var(--field)] sm:grid-cols-2">
            {knownFacts.map((fact) => (
              <li key={fact}>✓ {fact}</li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-[var(--muted)]">
            We don&apos;t have much yet — a short description below will help.
          </p>
        )}
        <p className="mt-3 text-xs text-[var(--muted)]">
          Something wrong? Update it in{" "}
          <Link href="/dashboard/website/details" className="underline">
            Website details
          </Link>
          , products, or fulfilment — not here.
        </p>
      </div>

      <form
        action={action}
        encType="multipart/form-data"
        className="flex flex-col gap-5"
      >
        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-medium text-[var(--field)]">
            What should your website focus on?
          </legend>
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
          <legend className="text-sm font-medium text-[var(--field)]">
            How should your website feel?
          </legend>
          <div className="flex flex-wrap gap-2">
            {FEEL_OPTIONS.map((opt) => (
              <ChoiceChip
                key={opt.id}
                label={opt.label}
                selected={feel === opt.id}
                onSelect={() => setFeel(opt.id)}
              />
            ))}
          </div>
          <input type="hidden" name="style" value={feel} />
        </fieldset>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-[var(--field)]">
            Anything you&apos;d like us to know?
          </span>
          <span className="text-xs text-[var(--muted)]">Optional</span>
          <textarea
            name="notes"
            rows={3}
            placeholder={
              suggestedQuestions[0] ??
              'e.g. "We\'re a family farm — put the farm stand first. Sourdough is growing fast."'
            }
            className={inputClass}
          />
        </label>

        {intake.askAbout ? (
          <label className="block text-sm">
            <span className="font-medium text-[var(--field)]">
              Tell us a little about your business
            </span>
            <span className="mt-0.5 block text-xs text-[var(--muted)]">
              What do you sell and what makes you special?
            </span>
            <textarea
              name="about"
              rows={4}
              defaultValue={intake.existingAbout}
              className={inputClass}
            />
          </label>
        ) : null}

        {intake.askHeroImage && !skipPhotos ? (
          <div className="flex flex-col gap-3 rounded-md border border-[var(--border)] px-4 py-4 text-sm">
            <p className="font-medium text-[var(--field)]">
              {intake.productPhotosReady
                ? "Your product photos are ready to use."
                : "A business photo would help."}
            </p>
            <p className="text-[var(--muted)]">
              A photo of your farm or business would make the site more personal.
            </p>
            <label className="block">
              <span className="text-xs font-medium text-[var(--field)]">Upload photos</span>
              <input
                name="heroImage"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className={inputClass}
              />
            </label>
            <button
              type="button"
              onClick={() => setSkipPhotos(true)}
              className="self-start text-sm text-[var(--muted)] underline"
            >
              Skip for now
            </button>
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-[var(--field)] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {pending
              ? "Building your website…"
              : path === "A"
                ? "Build my website"
                : "Build my website"}
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
          <p className="mt-2 text-xs">Your existing live website has not been changed.</p>
        </div>
      ) : null}

      {state.ok ? (
        <div className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-4 py-4 text-sm">
          <p className="font-medium text-[var(--field)]">✓ Your website is ready.</p>
          <p className="mt-1 text-[var(--muted)]">{state.summary}</p>
          {state.designSystem ? (
            <p className="mt-1 text-xs text-[var(--muted)]">
              Design system: {state.designSystem}
              {state.provider ? ` · ${state.provider}` : ""}
            </p>
          ) : null}
          {state.missing?.length ? (
            <div className="mt-3">
              <p className="text-[var(--field)]">It would be even stronger if you added:</p>
              <ul className="mt-1 list-disc pl-5 text-[var(--muted)]">
                {state.missing.map((m) => (
                  <li key={m.code}>{m.message}</li>
                ))}
              </ul>
            </div>
          ) : null}
          <div className="mt-4 flex flex-wrap gap-3">
            <a
              href={resolvedPreview}
              target="_blank"
              rel="noreferrer"
              className="rounded-md bg-[var(--field)] px-4 py-2 text-sm font-medium text-white"
            >
              Preview website
            </a>
            <Link
              href="/dashboard/website/studio"
              className="rounded-md border border-[var(--border)] px-4 py-2 text-sm"
            >
              Edit manually
            </Link>
          </div>
          <div className="mt-5 border-t border-[var(--border)] pt-4">
            <p className="font-medium text-[var(--field)]">Anything you&apos;d like changed?</p>
            <p className="mt-1 text-xs text-[var(--muted)]">
              Conversational edits are next — for now, regenerate above or use the manual
              editor. Try: &quot;Make it more modern&quot; · &quot;Put the farm stand
              first&quot; · &quot;Make the homepage shorter&quot;
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
