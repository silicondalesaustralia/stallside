import "./blog-content.css";
import { markdownLinksToHtml } from "@/lib/blog/markdown-links";
import { sanitizeBlogHtml } from "@/lib/blog/sanitize-blog-html";

export default function BlogHtml({ html }: { html: string }) {
  return (
    <div
      className="blog-html"
      dangerouslySetInnerHTML={{ __html: sanitizeBlogHtml(markdownLinksToHtml(html)) }}
    />
  );
}
