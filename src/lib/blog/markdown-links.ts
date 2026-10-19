/** Markdown links ([text](url), optionally with escaped brackets) that models emit inside HTML or plain text. */
const MARKDOWN_LINK = /\\?\[([^\]\\]+?)\\?\]\((https?:\/\/[^\s)]+)\)/g;

function cleanUrl(url: string): string {
  return url.replace(/\\(?=[_*])/g, "").replace(/"/g, "%22");
}

/** Convert Markdown links in HTML into anchors (the sanitizer still vets the result). */
export function markdownLinksToHtml(html: string): string {
  return html.replace(MARKDOWN_LINK, (_, text: string, url: string) => `<a href="${cleanUrl(url)}">${text}</a>`);
}

/** Plain-text fields (FAQ answers): drop "([source](url))" citations and keep the text of other links. */
export function stripMarkdownLinks(text: string): string {
  return text
    .replace(/\s*\(\s*\\?\[[^\]\\]+?\\?\]\(https?:\/\/[^\s)]+\)\s*\)/g, "")
    .replace(MARKDOWN_LINK, "$1")
    .replace(/\s+([.,;:])/g, "$1")
    .trim();
}
