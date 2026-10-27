import { toEmbedUrl } from "@/lib/knowledge-base";

type KnowledgeVideoProps = {
  videoUrl: string;
  title: string;
};

export default function KnowledgeVideo({ videoUrl, title }: KnowledgeVideoProps) {
  const embed = toEmbedUrl(videoUrl);
  if (!embed) return null;

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
