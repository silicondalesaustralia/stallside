"use client";

import { useActionState } from "react";
import { checkTagInstallation } from "./check-actions";
import { INITIAL_INSTALL_CHECK, type InstallCheckState } from "./tags-state";
import { tagsSecondaryButton } from "./tags-styles";

async function runCheck(): Promise<InstallCheckState> {
  return checkTagInstallation();
}

export default function InstallCheckButton() {
  const [state, action, pending] = useActionState(runCheck, INITIAL_INSTALL_CHECK);
  return (
    <form action={action} className="flex flex-col gap-2">
      <button type="submit" disabled={pending} className={`${tagsSecondaryButton} self-start`}>
        {pending ? "Checking your website…" : "Check installation"}
      </button>
      {state.message ? (
        <p role="status" className={`text-sm font-medium ${state.status === "error" ? "text-[var(--gone)]" : "text-[var(--field)]"}`}>
          {state.message} {state.url ? <span className="font-normal text-[var(--muted)]">({state.url})</span> : null}
        </p>
      ) : null}
      {state.lines.length > 0 ? (
        <ul className="divide-y divide-[var(--line)] rounded-xl border border-[var(--line)] text-sm">
          {state.lines.map((line) => (
            <li key={line.label} className="flex gap-2 px-3 py-2">
              <span aria-hidden className={line.ok ? "text-[var(--ok)]" : "text-[var(--gone)]"}>
                {line.ok ? "✓" : "✗"}
              </span>
              <span>
                <span className="font-medium">{line.label}</span>
                <span className="block text-xs text-[var(--muted)]">{line.detail}</span>
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </form>
  );
}
