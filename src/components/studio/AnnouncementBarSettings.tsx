"use client";

import {
  ANNOUNCEMENT_LINK_LABEL_MAX,
  ANNOUNCEMENT_TEXT_MAX,
  DEFAULT_ANNOUNCEMENT_BAR,
  type AnnouncementBar,
} from "@/lib/studio/announcement-bar";
import { paletteOf } from "@/lib/website/sections/colour";
import { useStudioEditorChrome, useStudioMetadata } from "./StudioEditorContext";
import ButtonLinkField from "./ButtonLinkField";
import ColourField from "./ColourField";
import PillChoice from "./PillChoice";

const INPUT = "w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm";
const LABEL = "block text-xs font-semibold text-[var(--field)]";

/** On/off, message, link and styling for the strip above the header. */
export default function AnnouncementBarSettings() {
  const palette = paletteOf(useStudioMetadata().resolvedBranding);
  const { announcementBar: bar, setAnnouncementBar, announcementBarStatus, announcementBarError } =
    useStudioEditorChrome();
  const set = (patch: Partial<AnnouncementBar>) => setAnnouncementBar?.({ ...(bar ?? DEFAULT_ANNOUNCEMENT_BAR), ...patch });
  const on = Boolean(bar?.enabled);

  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2 text-sm font-semibold text-[var(--field)]">
        <input type="checkbox" checked={on} onChange={(e) => set({ enabled: e.target.checked })} />
        Show announcement bar
      </label>
      <p className="text-xs text-[var(--muted)]">A thin strip at the very top of every page, above the header.</p>
      {on && bar ? (
        <>
          <div className="space-y-1.5">
            <label className={LABEL} htmlFor="announcement-text">Message</label>
            <textarea
              id="announcement-text"
              className={INPUT}
              rows={2}
              maxLength={ANNOUNCEMENT_TEXT_MAX}
              value={bar.text}
              onChange={(e) => set({ text: e.target.value.replace(/\n/g, " ") })}
            />
            <p className="text-right text-[10px] text-[var(--muted)]">{bar.text.length}/{ANNOUNCEMENT_TEXT_MAX}</p>
          </div>
          <ButtonLinkField
            label="Link"
            defaultLabel={null}
            emptyOptionLabel="No link"
            value={bar.link}
            onChange={(link) => set({ link })}
          />
          {bar.link ? (
            <div className="space-y-1.5">
              <label className={LABEL} htmlFor="announcement-link-label">Link text (optional)</label>
              <input
                id="announcement-link-label"
                className={INPUT}
                maxLength={ANNOUNCEMENT_LINK_LABEL_MAX}
                placeholder="e.g. Order now"
                value={bar.linkLabel ?? ""}
                onChange={(e) => set({ linkLabel: e.target.value || undefined })}
              />
              <p className="text-xs text-[var(--muted)]">Leave empty to make the whole message the link.</p>
            </div>
          ) : null}
          <ColourField
            label="Background"
            value={bar.background}
            onChange={(background) => set({ background })}
            palette={palette}
            noneLabel="Dark (default)"
          />
          <ColourField
            label="Text colour"
            value={bar.textColour}
            onChange={(textColour) => set({ textColour })}
            palette={palette}
            noneLabel="Auto (best contrast)"
          />
          <PillChoice label="Size" options={["sm", "md"] as const} labels={{ sm: "Slim", md: "Tall" }} value={bar.size} onChange={(size) => set({ size })} />
          <PillChoice label="Text position" options={["left", "centre"] as const} labels={{ left: "Left", centre: "Centred" }} value={bar.align} onChange={(align) => set({ align })} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={bar.bold !== false} onChange={(e) => set({ bold: e.target.checked })} />
            Bold text
          </label>
        </>
      ) : null}
      {announcementBarStatus === "saving" ? <p className="text-xs text-[var(--muted)]">Saving…</p> : null}
      {announcementBarStatus === "saved" ? <p className="text-xs text-[var(--muted)]">Announcement saved to draft.</p> : null}
      {announcementBarStatus === "error" ? (
        <p className="text-xs text-red-700">{announcementBarError ?? "Couldn’t save. Try again."}</p>
      ) : null}
    </div>
  );
}
