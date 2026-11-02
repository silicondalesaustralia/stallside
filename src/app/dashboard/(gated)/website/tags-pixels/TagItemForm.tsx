"use client";

import { useActionState } from "react";
import { tagItemValue, type TagItem } from "@/lib/website/tracking/catalog";
import type { StorefrontTracking, TrackingConsentMode } from "@/lib/website/tracking/types";
import { saveTagItem } from "./actions";
import ConsentFields from "./ConsentFields";
import CustomCodeField from "./CustomCodeField";
import TagIdFields from "./TagIdFields";
import { INITIAL_TAGS_STATE } from "./tags-state";
import { tagsCardClass, tagsPrimaryButton, tagsSecondaryButton } from "./tags-styles";

export default function TagItemForm({ item, draft }: { item: TagItem; draft: StorefrontTracking }) {
  const [state, action, pending] = useActionState(saveTagItem, INITIAL_TAGS_STATE);
  const values = state.status === "error" ? state.values : {};
  const submittedMode = values.consentMode;
  const consentMode: TrackingConsentMode =
    submittedMode === "off" || submittedMode === "eu" || submittedMode === "all" ? submittedMode : draft.consentMode;
  const savedKey = item.kind === "custom" ? draft.customHead : item.keys.map((k) => draft.ids[k] ?? "").join("|");
  const canRemove = item.kind !== "consent" && Boolean(tagItemValue(item, draft));

  return (
    <form action={action} className={`${tagsCardClass} flex flex-col gap-5`}>
      <input type="hidden" name="slug" value={item.slug} />
      {item.kind === "ids" ? (
        <TagIdFields key={savedKey} item={item} ids={draft.ids} values={values} errors={state.errors} />
      ) : null}
      {item.kind === "consent" ? (
        <ConsentFields
          consentMode={consentMode}
          privacyNotice={submittedMode !== undefined ? values.privacyNotice === "on" : draft.privacyNotice}
        />
      ) : null}
      {item.kind === "custom" ? <CustomCodeField key={savedKey} value={values.customHead ?? draft.customHead} /> : null}

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={pending} className={tagsPrimaryButton}>
          {pending ? "Saving…" : "Save"}
        </button>
        {canRemove ? (
          <button type="submit" name="intent" value="remove" disabled={pending} className={tagsSecondaryButton}>
            Remove
          </button>
        ) : null}
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
