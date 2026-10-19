import "./blog-content.css";
import type { BlogDiffPart } from "@/lib/blog/html-diff";
import { sanitizeBlogHtml } from "@/lib/blog/sanitize-blog-html";

const KIND_CLASS: Record<BlogDiffPart["kind"], string> = {
  same: "",
  added: "blog-diff-added",
  removed: "blog-diff-removed",
};

/** Article body with added blocks highlighted and removed blocks struck through. */
export default function BlogDiffView({ parts }: { parts: BlogDiffPart[] }) {
  return (
    <div className="blog-html">
      {parts.map((part, index) => (
        <div
          key={`${part.kind}-${index}`}
          className={KIND_CLASS[part.kind]}
          dangerouslySetInnerHTML={{ __html: sanitizeBlogHtml(part.html) }}
        />
      ))}
    </div>
  );
}
