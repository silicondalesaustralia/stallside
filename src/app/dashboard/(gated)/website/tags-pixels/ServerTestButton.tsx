"use client";

import { useActionState } from "react";
import type { ServerProvider } from "@/lib/website/tracking/server/send-conversions";
import { sendTestServerEvent } from "./secret-actions";
import ActionMessageView from "./ActionMessageView";
import { INITIAL_ACTION_MESSAGE } from "./tags-state";
import { tagsSecondaryButton } from "./tags-styles";

export default function ServerTestButton({ provider, label }: { provider: ServerProvider; label: string }) {
  const [state, action, pending] = useActionState(sendTestServerEvent, INITIAL_ACTION_MESSAGE);
  return (
    <form action={action} className="flex flex-col gap-1">
      <input type="hidden" name="provider" value={provider} />
      <button type="submit" disabled={pending} className={tagsSecondaryButton}>
        {pending ? "Sending…" : `Send ${label} test purchase`}
      </button>
      <ActionMessageView state={state} />
    </form>
  );
}
