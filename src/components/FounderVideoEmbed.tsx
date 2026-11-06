"use client";

import { useState } from "react";
import { Maximize2, Play } from "lucide-react";
import FounderVideoModal from "@/components/FounderVideoModal";
import { trackProUpgrade } from "@/lib/pro-upgrade-track";

type Props = { title: string; embedSrc: string; eventPrefix: "welcome" | "pro" };

/** Inline YouTube player plus an Expand button that opens it in a large pop-up. */
export default function FounderVideoEmbed({ title, embedSrc, eventPrefix }: Props) {
  const [expanded, setExpanded] = useState(false);

  function expand() {
    setExpanded(true);
    trackProUpgrade(`${eventPrefix}_video_expand`);
  }

  return (
    <div className="flex flex-col gap-2">
      {expanded ? (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="flex aspect-video w-full items-center justify-center rounded-xl border border-[var(--line)] bg-[var(--field)] text-sm font-semibold text-[var(--ink-on-dark)]"
        >
          <Play aria-hidden className="mr-2 size-4" /> Playing in the larger window
        </button>
      ) : (
        <iframe
          src={embedSrc}
          title={title}
          loading="lazy"
          className="aspect-video w-full rounded-xl border border-[var(--line)] bg-black"
          allow="encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
        />
      )}
      <button
        type="button"
        onClick={expand}
        className="inline-flex items-center gap-1.5 self-start rounded-lg border border-[var(--line)] bg-white px-3 py-1.5 text-sm font-semibold text-[var(--field)] hover:bg-[var(--wash)]"
      >
        <Maximize2 aria-hidden className="size-4" /> Expand video
      </button>
      <FounderVideoModal open={expanded} onClose={() => setExpanded(false)} title={title} embedSrc={embedSrc} />
    </div>
  );
}
