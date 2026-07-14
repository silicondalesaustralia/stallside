import { sanitizeSignHtml } from "@/lib/sanitize-sign-html";

export default function SafeSignHtml({
  html,
  className,
  allowStyles = false,
}: {
  html: string;
  className?: string;
  allowStyles?: boolean;
}) {
  const safe = sanitizeSignHtml(html, allowStyles);
  if (!safe) return null;
  return <div className={className} dangerouslySetInnerHTML={{ __html: safe }} />;
}
