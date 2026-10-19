import "./blog-content.css";
import { sanitizeBlogHtml } from "@/lib/blog/sanitize-blog-html";

export default function BlogHtml({ html }: { html: string }) {
  return (
    <div
      className="blog-html"
      dangerouslySetInnerHTML={{ __html: sanitizeBlogHtml(html) }}
    />
  );
}
