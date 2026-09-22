import type { CSSProperties, ReactNode } from "react";

/** Warm editorial tokens scoped to membership content (fonts stay sitewide). */
export const membershipContentStyle = {
  "--m-bg": "#F7F5EF",
  "--m-card": "#FFFDF8",
  "--m-ink": "#292F26",
  "--m-muted": "#656858",
  "--m-divider": "#DCDCCD",
  "--m-card-border": "#DFDFD3",
  "--m-button": "#344A2C",
  "--m-button-text": "#FFFFFF",
  "--m-selected-bg": "#E8EDDC",
  "--m-selected-border": "#4B613B",
  "--m-upfront-bg": "#F2EAD7",
  "--m-input": "#FFFFFF",
  "--m-input-border": "#CDD1C2",
} as CSSProperties;

export default function MembershipContentShell({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div
      style={membershipContentStyle}
      className="flex flex-col gap-6 bg-[var(--m-bg)] text-[15px] leading-[1.55] text-[var(--m-ink)] sm:gap-7"
    >
      {children}
    </div>
  );
}
