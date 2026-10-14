"use client";

import { announcementColours, isAnnouncementVisible, type AnnouncementBar } from "@/lib/studio/announcement-bar";
import { resolveButtonLink, type LinkContext } from "@/lib/studio/button-link";
import type { ThemePalette } from "@/lib/website/sections/colour";
import NavItemLink from "./NavItemLink";

/** The announcement strip at the very top of the site, above the header. */
export default function AnnouncementBarView({
  bar,
  linkContext,
  palette,
  editable,
  onSelect,
}: {
  bar: AnnouncementBar | null;
  linkContext: LinkContext;
  palette: ThemePalette;
  editable?: boolean;
  onSelect?: () => void;
}) {
  if (!isAnnouncementVisible(bar)) return null;
  const href = resolveButtonLink(bar.link, linkContext);
  const label = bar.linkLabel?.trim();
  const linkClass = "underline underline-offset-2";
  const text = bar.text.trim();

  let content;
  if (!href || editable) {
    content = (
      <>
        {text}
        {label ? <span className={`${linkClass} ml-2`}>{label}</span> : null}
      </>
    );
  } else if (label) {
    content = (
      <>
        {text}
        <NavItemLink href={href} className={`${linkClass} ml-2`}>
          {label}
        </NavItemLink>
      </>
    );
  } else {
    content = (
      <NavItemLink href={href} className="hover:underline">
        {text}
      </NavItemLink>
    );
  }

  return (
    <div
      className={`studio-announcement ${editable ? "cursor-pointer hover:opacity-95" : ""}`}
      style={announcementColours(bar, palette)}
      data-size={bar.size ?? "sm"}
      data-align={bar.align ?? "centre"}
      data-bold={bar.bold === false ? undefined : ""}
      role={editable ? "button" : "region"}
      aria-label={editable ? "Edit announcement bar" : "Announcement"}
      tabIndex={editable ? 0 : undefined}
      onClick={editable ? onSelect : undefined}
      onKeyDown={
        editable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect?.();
              }
            }
          : undefined
      }
    >
      <p className="studio-announcement__inner">{content}</p>
    </div>
  );
}
