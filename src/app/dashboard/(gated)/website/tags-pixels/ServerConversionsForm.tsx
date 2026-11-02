"use client";

import { useActionState } from "react";
import type { TrackingSecretKey, TrackingSecretsStatus, TrackingTestCodeKey } from "@/lib/website/tracking/secrets";
import type { ServerProvider } from "@/lib/website/tracking/server/send-conversions";
import { saveTrackingSecrets } from "./secret-actions";
import ActionMessageView from "./ActionMessageView";
import { INITIAL_ACTION_MESSAGE } from "./tags-state";
import { tagsCardClass, tagsInputClass, tagsPrimaryButton } from "./tags-styles";

type ServerSetup = { secret: TrackingSecretKey; label: string; help: string; testCode?: TrackingTestCodeKey };

const SETUP: Record<ServerProvider, ServerSetup> = {
  meta: { secret: "metaCapiToken", label: "Conversions API access token", help: "Events Manager → your pixel → Settings → Conversions API → Generate access token.", testCode: "metaTestEventCode" },
  tiktok: { secret: "tiktokAccessToken", label: "Events API access token", help: "Events Manager → your pixel → Settings → Events API → Generate access token.", testCode: "tiktokTestEventCode" },
  ga4: { secret: "ga4ApiSecret", label: "Measurement Protocol API secret", help: "Admin → Data streams → your stream → Measurement Protocol API secrets → Create." },
};

export default function ServerConversionsForm({ provider, status }: { provider: ServerProvider; status: TrackingSecretsStatus }) {
  const [state, action, pending] = useActionState(saveTrackingSecrets, INITIAL_ACTION_MESSAGE);
  const { secret, label, help, testCode } = SETUP[provider];
  const saved = status.saved[secret];
  return (
    <form action={action} className={tagsCardClass}>
      <h2 className="font-semibold text-[var(--field)]">Server-side purchase tracking</h2>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Ad blockers and iPhones hide a lot of browser purchases. With this, Vendl also reports each paid website order
        straight from our server. The platform matches the two copies, so each sale counts once. Tokens are encrypted and
        never shown again.
      </p>
      <div className="mt-4 flex flex-col gap-4 text-sm">
        <label className="block">
          <span className="flex items-center justify-between gap-2 font-medium">
            {label}
            {saved ? <span className="text-xs font-semibold text-[var(--ok)]">Saved</span> : null}
          </span>
          <input
            type="password"
            name={secret}
            autoComplete="off"
            placeholder={saved ? "•••••••• (leave blank to keep)" : "Paste token"}
            className={tagsInputClass}
          />
          <span className="mt-1 block text-xs text-[var(--muted)]">{help}</span>
        </label>
        {saved ? (
          <label className="flex items-center gap-2 text-xs">
            <input type="checkbox" name={`clear_${secret}`} /> Remove saved token
          </label>
        ) : null}
        {testCode ? (
          <label className="block">
            <span className="font-medium">Test event code</span>
            <input name={testCode} defaultValue={status.testCodes[testCode] ?? ""} placeholder="TEST12345" className={tagsInputClass} />
            <span className="mt-1 block text-xs text-[var(--muted)]">Events Manager → Test events. Only used by the test button.</span>
          </label>
        ) : null}
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
