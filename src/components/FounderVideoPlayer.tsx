"use client";

import { useRef } from "react";
import type { FounderVideo } from "@/lib/founder-videos";
import { trackProUpgrade } from "@/lib/pro-upgrade-track";

type Props = { video: FounderVideo & { src: string }; eventPrefix: "welcome" | "pro" };

/** Native player: no autoplay, no loop, metadata-only preload; play/complete tracked once per page view. */
export default function FounderVideoPlayer({ video, eventPrefix }: Props) {
  const played = useRef(false);
  const completed = useRef(false);
  return (
    <video
      className="aspect-video w-full rounded-xl border border-[var(--line)] bg-black"
      controls
      preload="metadata"
      playsInline
      poster={video.poster ?? undefined}
      aria-label={video.title}
      onPlay={() => {
        if (played.current) return;
        played.current = true;
        trackProUpgrade(`${eventPrefix}_video_play`);
      }}
      onEnded={() => {
        if (completed.current) return;
        completed.current = true;
        trackProUpgrade(`${eventPrefix}_video_complete`);
      }}
    >
      <source src={video.src} />
      {video.captions ? <track kind="captions" src={video.captions} srcLang="en" label="English" default /> : null}
    </video>
  );
}
