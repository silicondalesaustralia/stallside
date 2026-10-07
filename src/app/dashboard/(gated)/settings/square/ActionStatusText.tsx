import type { ActionStatus } from "./use-action-status";

export default function ActionStatusText({ status }: { status: ActionStatus }) {
  if (!status) return null;
  return (
    <p
      role="status"
      className={`text-sm font-medium ${
        status.tone === "ok" ? "text-[var(--ok)]" : "text-red-700"
      }`}
    >
      {status.text}
    </p>
  );
}
