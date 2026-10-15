"use client";

import { useCallback, useState, useTransition } from "react";
import { saveBriefAction } from "@/app/dashboard/(gated)/website/assistant/actions";
import type { BriefData } from "@/lib/website-ai/assistant/brief/schema";
import type { WizardData } from "@/lib/website-ai/assistant/load-wizard";
import AssistantStepper from "./AssistantStepper";
import BusinessStep from "./BusinessStep";
import BrandingStep from "./BrandingStep";
import PagesStep from "./PagesStep";
import CreateStep from "./CreateStep";
import BuildProgress from "./BuildProgress";
import { primaryButton, secondaryButton, type BriefUpdater } from "./assistant-copy";

type Props = { data: Omit<WizardData, "lastJobId"> };

export default function WebsiteAssistant({ data }: Props) {
  const [brief, setBrief] = useState<BriefData>(data.brief);
  const [revision, setRevision] = useState(data.briefRevision);
  const [options, setOptions] = useState(data.pageOptions);
  const [step, setStep] = useState(data.activeJobId ? 4 : data.brief.step);
  const [jobId, setJobId] = useState<string | null>(data.activeJobId);
  const [error, setError] = useState<string | null>(null);
  const [saving, start] = useTransition();

  const update: BriefUpdater = useCallback((fn) => setBrief((prev) => fn(prev)), []);

  const saveNow = useCallback(
    async (nextStep?: number): Promise<boolean> => {
      const payload = { ...brief, step: nextStep ?? step };
      const res = await saveBriefAction(revision, payload);
      if (!res.ok) {
        setError(res.error);
        return false;
      }
      setError(null);
      setRevision(res.revision);
      setOptions(res.pageOptions);
      return true;
    },
    [brief, revision, step],
  );

  const goTo = (next: number) =>
    start(async () => {
      if (await saveNow(next)) setStep(next);
    });

  return (
    <div className="flex flex-col gap-6">
      <AssistantStepper step={step} onStep={goTo} disabled={saving || Boolean(jobId)} />
      {jobId ? (
        <BuildProgress
          jobId={jobId}
          previewPath={data.previewPath}
          editorHref={data.editorHref}
          onReset={() => {
            setJobId(null);
            setStep(1);
          }}
        />
      ) : (
        <>
          {step === 1 ? <BusinessStep brief={brief} update={update} aiAvailable={data.aiAvailable} /> : null}
          {step === 2 ? <BrandingStep brief={brief} update={update} /> : null}
          {step === 3 ? <PagesStep brief={brief} update={update} options={options} notes={data.featureNotes} /> : null}
          {step === 4 ? (
            <CreateStep
              brief={brief}
              hasExistingSite={data.hasExistingSite}
              isPublished={data.isPublished}
              aiAvailable={data.aiAvailable}
              saveNow={() => saveNow(4)}
              onStarted={setJobId}
            />
          ) : null}
          <div className="flex flex-wrap gap-2">
            {step > 1 ? (
              <button type="button" className={secondaryButton} disabled={saving} onClick={() => goTo(step - 1)}>
                Back
              </button>
            ) : null}
            {step < 4 ? (
              <button type="button" className={primaryButton} disabled={saving} onClick={() => goTo(step + 1)}>
                {saving ? "Saving…" : "Next"}
              </button>
            ) : null}
          </div>
        </>
      )}
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
    </div>
  );
}
