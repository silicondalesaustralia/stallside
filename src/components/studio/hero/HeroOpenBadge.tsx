"use client";

import SectionCopy from "@/components/studio/SectionCopy";
import { hoursLines, openStatus } from "@/lib/studio/open-status";
import type { StudioMetadata } from "@/lib/studio/types";
import { useNowSeconds } from "./useNowSeconds";

const BADGE = "inline-flex items-center gap-2 rounded-md border border-[var(--line)] bg-[var(--panel)] px-3 py-1.5 text-sm font-semibold text-[var(--field)]";

/**
 * Live "Open now · until 5pm" / "Closed · opens Sat 8am" from the seller's hours. Without hours
 * it keeps the seller's own editable badge wording.
 */
export default function HeroOpenBadge({ meta }: { meta: StudioMetadata }) {
  const now = useNowSeconds();
  const stand = meta.standHours;
  if (!stand) {
    return (
      <span className={BADGE}>
        <SectionCopy k="standBadge" fallback="Farm stand open" />
      </span>
    );
  }
  const status = now === null ? null : openStatus(stand.hours, stand.timeZone, new Date(now * 1000));
  const label = status?.label ?? hoursLines(stand.hours)[0] ?? "";
  if (!label) return null;
  return (
    <span className={BADGE}>
      {status ? (
        <span
          aria-hidden
          className={`h-2 w-2 rounded-full ${status.open ? "bg-[var(--leaf,#2f7d32)]" : "bg-[var(--muted)]"}`}
        />
      ) : null}
      {label}
    </span>
  );
}
