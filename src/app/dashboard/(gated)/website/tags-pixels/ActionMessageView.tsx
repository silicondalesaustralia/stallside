import type { ActionMessage } from "./tags-state";

export default function ActionMessageView({ state }: { state: ActionMessage }) {
  if (!state.message) return null;
  const tone = state.status === "error" ? "text-[var(--gone)]" : "text-[var(--ok)]";
  return (
    <div role="status" className="text-sm">
      <p className={`font-medium ${tone}`}>{state.message}</p>
      {state.lines?.map((line) => (
        <p key={line} className="mt-0.5 break-words text-xs text-[var(--muted)]">
          {line}
        </p>
      ))}
    </div>
  );
}
