import type { ReactNode } from "react";
import FounderVideoPlaceholder from "@/components/FounderVideoPlaceholder";
import FounderVideoPlayer from "@/components/FounderVideoPlayer";
import FounderVideoEmbed from "@/components/FounderVideoEmbed";
import { founderVideoEmbedSrc, type FounderVideo } from "@/lib/founder-videos";

type Props = {
  id?: string;
  heading: string;
  description: string;
  video: FounderVideo;
  eventPrefix: "welcome" | "pro";
  action: ReactNode;
  /** compact: small video beside the text (onboarding); wide: larger video under the text. */
  variant?: "compact" | "wide";
};

/** Founder video (YouTube, else MP4) with a placeholder until one is configured in founder-videos.ts. */
export default function FounderVideoSection({ id, heading, description, video, eventPrefix, action, variant = "wide" }: Props) {
  const src = video.src;
  const embedSrc = founderVideoEmbedSrc(video);
  const media = embedSrc ? (
    <FounderVideoEmbed title={video.title} embedSrc={embedSrc} eventPrefix={eventPrefix} />
  ) : src ? (
    <FounderVideoPlayer video={{ ...video, src }} eventPrefix={eventPrefix} />
  ) : (
    <FounderVideoPlaceholder video={video} />
  );
  const headingId = `${eventPrefix}-video-heading`;
  const text = (
    <div className="flex flex-col gap-3">
      <h2 id={headingId} className="text-xl font-semibold text-[var(--field)]">
        {heading}
      </h2>
      <p className="text-sm text-[var(--muted)]">{description}</p>
      <div>{action}</div>
    </div>
  );

  if (variant === "compact") {
    return (
      <section id={id} aria-labelledby={headingId} className="dash-card grid items-center gap-5 p-5 md:grid-cols-[minmax(0,320px)_1fr]">
        {media}
        {text}
      </section>
    );
  }
  return (
    <section id={id} aria-labelledby={headingId} className="flex flex-col gap-4">
      {text}
      <div className="mx-auto w-full max-w-3xl">{media}</div>
    </section>
  );
}
