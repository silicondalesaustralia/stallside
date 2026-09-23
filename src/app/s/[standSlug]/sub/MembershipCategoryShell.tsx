import type { CSSProperties, ReactNode } from "react";

/** Warm editorial tokens for the memberships category listing. */
export const membershipCategoryStyle = {
  "--mc-bg": "#F7F5EF",
  "--mc-card": "#FFFDF8",
  "--mc-ink": "#292F26",
  "--mc-muted": "#656858",
  "--mc-border": "#DFDFD3",
  "--mc-divider": "#E3E3D9",
  "--mc-label": "#526244",
  "--mc-action": "#344A2C",
  "--mc-action-text": "#FFFFFF",
} as CSSProperties;

export default function MembershipCategoryShell({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <section
      style={membershipCategoryStyle}
      className="w-full bg-[var(--mc-bg)] text-[var(--mc-ink)]"
    >
      <div className="membership-category mx-auto max-w-[960px] px-4 py-6 sm:px-6 sm:py-[30px]">
        {children}
      </div>
    </section>
  );
}