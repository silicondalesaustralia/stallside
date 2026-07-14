import { sanitizeSignHtml } from "@/lib/sanitize-sign-html";

export default function SafeSignHtml({
  html,
  className,
}: {
  html: string;
  className?: string;
}) {
  const safe = sanitizeSignHtml(html);
  if (!safe) return null;
  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: safe }}
    />
  );
}
