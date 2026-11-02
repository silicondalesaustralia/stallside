"use client";

import { useActionState } from "react";
import type { StorefrontTracking, TrackingConsentMode } from "@/lib/website/tracking/types";
import { saveTrackingSettings } from "./actions";
import ConsentFields from "./ConsentFields";
import CustomCodeField from "./CustomCodeField";
import TrackingFieldGroup from "./TrackingFieldGroup";
import { INITIAL_TAGS_STATE } from "./tags-state";
import { tagsPrimaryButton } from "./tags-styles";

export default function TagsSettingsForm({ draft }: { draft: StorefrontTracking }) {
  const [state, action, pending] = useActionState(saveTrackingSettings, INITIAL_TAGS_STATE);
  const values = state.status === "error" ? state.values : {};
  const submitted = values.consentMode;
  const consentMode: TrackingConsentMode =
    submitted === "off" || submitted === "eu" || submitted === "all" ? submitted : draft.consentMode;
  const privacyNotice = values.consentMode !== undefined ? values.privacyNotice === "1" : draft.privacyNotice;

  return (
    <form action={action} className="flex flex-col gap-6">
      <TrackingFieldGroup group="verification" ids={draft.ids} values={values} errors={state.errors} />
      <TrackingFieldGroup group="analytics" ids={draft.ids} values={values} errors={state.errors} />
      <TrackingFieldGroup group="ads" ids={draft.ids} values={values} errors={state.errors} />
      <ConsentFields consentMode={consentMode} privacyNotice={privacyNotice} />
      <CustomCodeField value={values.customHead ?? draft.customHead} />
      <div className="sticky bottom-3 z-10 flex flex-wrap items-center gap-3 rounded-2xl border border-[var(--line)] bg-white/95 p-3 shadow-sm">
        <button type="submit" disabled={pending} className={tagsPrimaryButton}>
          {pending ? "Saving…" : "Save tags"}
        </button>
        {state.message ? (
          <p role="status" className={`text-sm font-medium ${state.status === "error" ? "text-[var(--gone)]" : "text-[var(--ok)]"}`}>
            {state.message}
          </p>
        ) : null}
      </div>
      {state.warnings.length > 0 ? (
        <ul className="list-disc pl-5 text-sm text-amber-800">
          {state.warnings.map((w) => (
            <li key={w}>{w}</li>
          ))}
        </ul>
      ) : null}
    </form>
  );
}
