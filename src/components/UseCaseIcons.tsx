import type { ReactNode } from "react";

function Frame() {
  return (
    <rect
      x="3"
      y="3"
      width="42"
      height="42"
      rx="12"
      stroke="var(--line)"
      strokeWidth="1.5"
    />
  );
}

type IconProps = { className?: string };

function IconShell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      className={className ?? "size-[42px]"}
      aria-hidden="true"
    >
      <Frame />
      {children}
    </svg>
  );
}

export function FarmStallsIcon({ className }: IconProps) {
  return (
    <IconShell className={className}>
      <ellipse cx="19" cy="27" rx="7" ry="9" fill="var(--leaf)" />
      <ellipse cx="30" cy="24" rx="7" ry="9" fill="var(--field)" />
    </IconShell>
  );
}

export function FirewoodIcon({ className }: IconProps) {
  return (
    <IconShell className={className}>
      <circle cx="17" cy="30" r="6" fill="var(--field)" />
      <circle cx="17" cy="30" r="2" fill="var(--marigold)" />
      <circle cx="31" cy="30" r="6" fill="var(--field)" />
      <circle cx="31" cy="30" r="2" fill="var(--marigold)" />
      <circle cx="24" cy="19" r="6" fill="var(--leaf)" />
      <circle cx="24" cy="19" r="2" fill="var(--marigold)" />
    </IconShell>
  );
}

export function FlowersIcon({ className }: IconProps) {
  return (
    <IconShell className={className}>
      <path d="M16 36 L18 24 H30 L32 36 Z" fill="var(--field)" />
      <circle cx="19" cy="17" r="4" fill="var(--leaf)" />
      <circle cx="29" cy="17" r="4" fill="var(--leaf)" />
      <circle cx="24" cy="13" r="4" fill="var(--marigold)" />
      <path d="M24 24 V17" stroke="var(--leaf)" strokeWidth="1.5" />
    </IconShell>
  );
}

export function CampIcon({ className }: IconProps) {
  return (
    <IconShell className={className}>
      <path d="M24 12 L36 34 H12 Z" fill="var(--field)" />
      <path d="M24 22 L30 34 H18 Z" fill="var(--leaf)" />
      <circle cx="24" cy="30" r="2.5" fill="var(--marigold)" />
    </IconShell>
  );
}

export function CarParkIcon({ className }: IconProps) {
  return (
    <IconShell className={className}>
      <rect x="14" y="12" width="20" height="24" rx="4" fill="var(--field)" />
      <path
        d="M21 30 V18 H26 a4 4 0 0 1 0 8 H21"
        stroke="var(--marigold)"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
    </IconShell>
  );
}

export function FridgeIcon({ className }: IconProps) {
  return (
    <IconShell className={className}>
      <rect x="15" y="11" width="18" height="26" rx="4" fill="var(--field)" />
      <path d="M15 22 H33" stroke="var(--wash)" strokeWidth="1.5" />
      <path d="M29 16 V19" stroke="var(--marigold)" strokeWidth="2" strokeLinecap="round" />
      <path d="M29 26 V29" stroke="var(--marigold)" strokeWidth="2" strokeLinecap="round" />
    </IconShell>
  );
}
