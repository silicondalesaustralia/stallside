import type { SVGProps } from "react";

/** TikTok mark drawn in the same outline style as the lucide icons beside it. */
export default function TikTokIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M15 3c.5 2.6 2.2 4.2 5 4.5v3.3c-1.9 0-3.6-.6-5-1.7V15a6 6 0 1 1-6-6v3.4A2.6 2.6 0 1 0 11.6 15V3z" />
    </svg>
  );
}
