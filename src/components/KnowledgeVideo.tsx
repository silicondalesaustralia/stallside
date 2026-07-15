import { toEmbedUrl } from "@/lib/knowledge-base";

type KnowledgeVideoProps = {
  videoUrl: string | null;
  title: string;
};

export default function KnowledgeVideo({ videoUrl, title }: KnowledgeVideoProps) {
  const embed = toEmbedUrl(videoUrl);

  if (!embed) {
    return (
      <div className="flex aspect-video items-center justify-center rounded-2xl border border-dashed border-[var(--line)] bg-[var(--panel)] px-6 text-center text-sm text-[var(--muted)]">
        Video coming soon — written steps below work without it.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--line)] bg-black shadow-sm">
      <div className="relative aspect-video w-full">
        <iframe
          src={embed}
          title={title}
          className="absolute inset-0 size-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );
}
