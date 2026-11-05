import { Video } from "lucide-react";
import type { FounderVideo } from "@/lib/founder-videos";

/** Non-interactive "coming soon" artwork; loads no media and has no play control. */
export default function FounderVideoPlaceholder({ video }: { video: FounderVideo }) {
  return (
    <div
      role="img"
      aria-label={`${video.title} video placeholder. ${video.placeholderMessage}`}
      className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--field)] p-4 text-center text-[var(--ink-on-dark)]"
    >
      <Video aria-hidden className="size-8 text-[var(--marigold)]" />
      <p className="font-semibold">{video.title}</p>
      <p className="text-sm opacity-85">{video.placeholderMessage}</p>
      <span className="rounded-full border border-white/25 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide opacity-90">
        Coming soon · {video.durationLabel}
      </span>
    </div>
  );
}
