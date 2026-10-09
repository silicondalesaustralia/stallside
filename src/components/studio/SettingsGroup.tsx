"use client";

import type { ReactNode } from "react";

/** A collapsible group in the editor's settings panel. */
export default function SettingsGroup({
  title,
  open,
  onToggle,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: (open: boolean) => void;
  children: ReactNode;
}) {
  return (
    <details
      className="vendl-settings-group"
      open={open}
      onToggle={(e) => {
        const next = e.currentTarget.open;
        if (next !== open) onToggle(next);
      }}
    >
      <summary className="vendl-settings-group__summary">{title}</summary>
      <div className="vendl-settings-group__body space-y-4">{children}</div>
    </details>
  );
}
