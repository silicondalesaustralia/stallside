"use client";

import { useActionState } from "react";
import type { TrackingSecretKey, TrackingSecretsStatus } from "@/lib/website/tracking/secrets";
import { saveTrackingSecrets } from "./secret-actions";
import ActionMessageView from "./ActionMessageView";
import { INITIAL_ACTION_MESSAGE } from "./tags-state";
import { tagsCardClass, tagsInputClass, tagsPrimaryButton } from "./tags-styles";

const SECRETS: { key: TrackingSecretKey; label: string; help: string }[] = [
  { key: "metaCapiToken", label: "Meta Conversions API access token", help: "Events Manager → your pixel → Settings → Conversions API → Generate access token." },
  { key: "tiktokAccessToken", label: "TikTok Events API access token", help: "Events Manager → your pixel → Settings → Events API → Generate access token." },
  { key: "ga4ApiSecret", label: "GA4 Measurement Protocol API secret", help: "Admin → Data streams → your stream → Measurement Protocol API secrets → Create." },
];

export default function ServerConversionsForm({ status }: { status: TrackingSecretsStatus }) {
  const [state, action, pending] = useActionState(saveTrackingSecrets, INITIAL_ACTION_MESSAGE);
  return (
    <form action={action} className={tagsCardClass}>
      <h2 className="font-semibold text-[var(--field)]">Server-side purchase tracking</h2>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Ad blockers and iPhones hide a lot of browser purchases. With these, Vendl also reports each paid website order
        straight from our server. The platforms match the two copies, so each sale counts once. Tokens are encrypted and
        never shown again.
      </p>
      <div className="mt-4 flex flex-col gap-4">
        {SECRETS.map((s) => (
          <div key={s.key} className="text-sm">
            <label className="block">
              <span className="flex items-center justify-between gap-2 font-medium">
                {s.label}
                {status.saved[s.key] ? <span className="text-xs font-semibold text-[var(--ok)]">Saved</span> : null}
              </span>
              <input
                type="password"
                name={s.key}
                autoComplete="off"
                placeholder={status.saved[s.key] ? "•••••••• (leave blank to keep)" : "Paste token"}
                className={tagsInputClass}
              />
              <span className="mt-1 block text-xs text-[var(--muted)]">{s.help}</span>
            </label>
            {status.saved[s.key] ? (
              <label className="mt-1 flex items-center gap-2 text-xs">
                <input type="checkbox" name={`clear_${s.key}`} /> Remove saved token
              </label>
            ) : null}
          </div>
        ))}
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="font-medium">Meta test event code</span>
            <input name="metaTestEventCode" defaultValue={status.testCodes.metaTestEventCode ?? ""} placeholder="TEST12345" className={tagsInputClass} />
            <span className="mt-1 block text-xs text-[var(--muted)]">Events Manager → Test events. Only used by the test button.</span>
          </label>
          <label className="block text-sm">
            <span className="font-medium">TikTok test event code</span>
            <input name="tiktokTestEventCode" defaultValue={status.testCodes.tiktokTestEventCode ?? ""} placeholder="TEST12345" className={tagsInputClass} />
            <span className="mt-1 block text-xs text-[var(--muted)]">Events Manager → Test events. Only used by the test button.</span>
          </label>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button type="submit" disabled={pending} className={tagsPrimaryButton}>
          {pending ? "Saving…" : "Save server settings"}
        </button>
        <ActionMessageView state={state} />
      </div>
    </form>
  );
}
